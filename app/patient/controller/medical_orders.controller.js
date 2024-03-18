(function () {
  function MedicalOrdersCtrl(
    $rootScope,
    $formService,
    $filter,
    PatientDAO,
    PatientRecordDAO,
    $state,
    $stateParams,
    $http,
    $sce,
    $window,
    $timeout,
    $scope
  ) {
    "use strict";
    var ctrl = this;
    ctrl.patientId = $state.params.id;
    ctrl.patientName;
    ctrl.params = $stateParams;

    ctrl.currentDate = new Date();
    ctrl.currentDateWithFormat = $filter("date")(
      ctrl.currentDate,
      "MM/dd/yyyy"
    );

    ctrl.refreshactivitys = function () {
      $timeout(function () {
        $("#activityOtherText").tagsinput(
          "add",
          ctrl.medicalOrderForm.otheractivitys
        );
      });
    };

    ctrl.activityOptionsKeyValue = [
      { key: "Complete Bedrest" },
      { key: "Bedrest BRP" },
      { key: "Up As Tolerated" },
      { key: "Transfer Bed/Chair" },
      { key: "Exercise Prescribed" },
      { key: "Partial Weight Bearing" },
      { key: "Independent At Home" },
      { key: "Crutches" },
      { key: "Cane" },
      { key: "Wheelchair" },
      { key: "Walker" },
      { key: "No Restrictions" },
    ];
    ctrl.mentalStatusKeyValue = [
      { key: "Oriented", value: false },
      { key: "Comatose", value: false },
      { key: "Forgetful", value: false },
      { key: "Depressed", value: false },
      { key: "Disoriented", value: false },
      { key: "Lethargic", value: false },
      { key: "Agitated", value: false },
      { key: "Others", value: false },
    ];
    ctrl.activityOtherText = "";
    ctrl.otheractivityCheckbox = false;

    ctrl.medicalOrderForm = {
      orders: [{ discipline: "", frequency: "", duration: "" }],
    };

    ctrl.addMoreOrders = function () {
      ctrl.medicalOrderForm.orders.push({
        discipline: "",
        frequency: "",
        duration: "",
      });
    };

    ctrl.removeOrder = function (index) {
      ctrl.medicalOrderForm.orders.splice(index, 1);
    };

    ctrl.generateFormCall = generateForms;
    ctrl.clearSignatureCall = clearSignature;

    ctrl.dataInit = function () {
      // $formService.resetRadios()
    };

    ctrl.refreshotherMentalStatus = function () {
      $timeout(function () {
        $("#otherMentalStatus").tagsinput(
          "add",
          ctrl.medicalOrderForm.otherMentalStatus
        );
      });
    };

    /*================   FUNCTION CALLS   ===================*/
    ctrl.generateFormCall();

    /*================   FORM FUNCTIONS   ===================*/
    function generateForms() {
      $rootScope.isFormDirty = false;
      ctrl.clearSignatureCall();
      if (ctrl.params?.id) {
        $rootScope.maskLoading();
        PatientDAO.get({ id: $state.params.id })
          .then(function (res) {
            ctrl.patient = res;
            ctrl.patientName = res.fName;

            // res.activityOptions = "Complete Bedrest,Bedrest BRP,Exercise Prescribed,Partial Weight Bearing";
            // res.otheractivitys = "sfasf,asfe3333";
            // // orderd initialize
            // res.orders = [
            //             {discipline: 'asdf11111', frequency: 'asdf1111 fffff', duration: 234},
            //             {discipline: 'asdf22222', frequency: 'asf 2222   ffffffffff2222222', duration: 567},
            //             {discipline: 'asdf', frequency: 'ferwe', duration: 5555555}
            //         ]

            ctrl.medicalOrderForm = {
              patientHIClaimNo: "", //auto fill ?
              certificationPeriodFrom: res?.certificationPeriodFrom || "",
              certificationPeriodTo: res?.certificationPeriodTo || "",
              //mentalStatus: res?.mentalStatus? res?.mentalStatus: "", // auto fill taken from assessment
              otherMentalStatus: res?.otherMentalStatus
                ? res?.otherMentalStatus
                : "",
              prognosis: "",
              orders: res?.orders
                ? res?.orders
                : [{ discipline: "", frequency: "", duration: "" }],
              goals: "",
              signature: null,
              signatureDate: res?.signatureDate
                ? res?.signatureDate
                : res.currentDateWithFormat,
              physicianNameAndAddress: "",
              physicianSignatureDate: "",
              dateOfHHASignedPOT: "",
            };

            ctrl.medicalOrderForm.activityOptions = res?.activityOptions || "";
            ctrl.medicalOrderForm.otheractivitys = res?.otheractivitys
              ? res?.otheractivitys
              : "";
            // check by default if activityOptions has any value
            if (res.activityOptions != null) {
              var activitys = res.activityOptions;
              angular.forEach(ctrl.activityOptionsKeyValue, function (obj) {
                if (activitys.indexOf(obj.key) >= 0) {
                  obj.value = true;
                }
              });
            }
            // check by default if any value of otheractivitys and show input
            if (
              ctrl.medicalOrderForm.otheractivitys != null &&
              ctrl.medicalOrderForm.otheractivitys != ""
            ) {
              ctrl.otheractivityCheckbox = true;
              ctrl.refreshactivitys();
            }

            // check by default if mentalStatus has any value
            ctrl.medicalOrderForm.mentalStatus = res?.mentalStatus || "";
            if (res.mentalStatus != null) {
              var mentalStatuses = res.mentalStatus;
              angular.forEach(ctrl.mentalStatusKeyValue, function (obj) {
                if (mentalStatuses.indexOf(obj.key) >= 0) {
                  obj.value = true;
                }
                if (obj.key == "Others") {
                  //for Other checkbox value true mental status
                  if (
                    obj.key == "Others" &&
                    res?.otherMentalStatus != null &&
                    res?.otherMentalStatus != ""
                  ) {
                    obj.value = true;
                  }
                }
              });
            }
            // check by default if any value of otheractivitys and show input
            if (
              ctrl.medicalOrderForm.otherMentalStatus != null &&
              ctrl.medicalOrderForm.otherMentalStatus != ""
            ) {
              ctrl.refreshotherMentalStatus();
            }

            setTimeout(function () {
              $formService.resetRadios();
            }, 100);
          })
          .catch((err) => {
            showLoadingBar({
              delay: 0.5,
              pct: 100,
              finish: function () {},
            });
            toastr.error("Failed to retrieve patient");
            $window.history.back();
          })
          .then(() => {
            // setTimeout(function () {
            //     //Reset dirty status of form
            //     if ($.fn.dirtyForms) {
            //         $('form').dirtyForms('setClean');
            //         $('.dirty').removeClass('dirty');
            //     }
            // }, 100);

            $rootScope.unmaskLoading();
          });
      } else {
        ctrl.medicalOrderForm = {
          patientHIClaimNo: ctrl.patientHIClaimNo,
          certificationPeriodFrom: "",
          certificationPeriodTo: "",
          mentalStatus: "",
          otherMentalStatus: "",
          prognosis: "",
          orders: [{ discipline: "", frequency: "", duration: "" }],
          goals: "",
          signature: null,
          signatureDate: ctrl.currentDateWithFormat,
          physicianNameAndAddress: "",
          dateOfHHASignedPOT: "",
          physicianSignatureDate: "",
        };
        setTimeout(function () {
          $formService.resetRadios();
        }, 100);

        setupWatch();
      }
    }

    function clearSignature() {
      ctrl.medicalOrderForm.signature = "";
    }

    ctrl.submitForm = function () {
      console.log(" ctrl.medicalOrderForm", ctrl.medicalOrderForm);

      if ($("#med_Order_form")[0].checkValidity()) {
        var medicalOrderFormToSave = angular.copy(ctrl.medicalOrderForm);
        // signature
        medicalOrderFormToSave.signature = medicalOrderFormToSave.signature
          ? medicalOrderFormToSave.signature.substring(
              medicalOrderFormToSave.signature.indexOf(",") + 1
            )
          : null;

        // ActivityOtions
        medicalOrderFormToSave.activityOptions = [];
        angular.forEach(ctrl.activityOptionsKeyValue, function (obj) {
          if (obj.value == true) {
            medicalOrderFormToSave.activityOptions.push(obj.key);
          }
        });
        medicalOrderFormToSave.activityOptions =
          medicalOrderFormToSave.activityOptions.toString();

        // otheractivitys
        if (
          (medicalOrderFormToSave.otheractivitys == "" &&
            ctrl.otheractivityCheckbox == true) ||
          ctrl.otheractivityCheckbox == false
        ) {
          delete medicalOrderFormToSave.otheractivitys;
        }

        // mentalStatus
        medicalOrderFormToSave.mentalStatus = [];
        angular.forEach(ctrl.mentalStatusKeyValue, function (obj) {
          if (obj.value == true && obj.key != "Others") {
            medicalOrderFormToSave.mentalStatus.push(obj.key);
          }
          // otherMentalStatus
          if (
            (obj.value == false && obj.key == "Others") ||
            (obj.value == true &&
              obj.key == "Others" &&
              (medicalOrderFormToSave.otherMentalStatus == "" ||
                medicalOrderFormToSave.otherMentalStatus == null ||
                medicalOrderFormToSave.otherMentalStatus == undefined))
          ) {
            delete medicalOrderFormToSave.otherMentalStatus;
          }
        });
        medicalOrderFormToSave.mentalStatus =
          medicalOrderFormToSave.mentalStatus.toString();

        console.log(
          "medicalOrderForm, medicalOrderFormToSave",
          ctrl.medicalOrderForm,
          medicalOrderFormToSave
        );

        // $state.go('app.patient_records_patient', { patientId: ctrl.patientId });
        $rootScope.maskLoading();
        if (ctrl.params?.id) {
          medicalOrderFormToSave.id = ctrl.params?.id;
          PatientRecordDAO.updateMedOrder(medicalOrderFormToSave)
            .then((res) => {
              // ctrl.generateFormCall();
              $rootScope.isFormDirty = false;
              toastr.success("Medical Order updated successfully");
              if ($.fn.dirtyForms) {
                $("form").dirtyForms("setClean");
                $(".dirty").removeClass("dirty");
              }

              // $state.go('app.complaints', { status: 'open' });
              $state.go("app.patient_records_patient", {
                patientId: ctrl.patientId,
              });
            })
            .catch((err) => {
              toastr.error("Unable to update the Medical Order.");
            })
            .then(function () {
              $rootScope.unmaskLoading();
            });
        } else {
          PatientRecordDAO.addMedOrder(medicalOrderFormToSave)
            .then((res) => {
              // ctrl.generateFormCall();
              $rootScope.isFormDirty = false;
              toastr.success("Medical Order saved successfully");
              if ($.fn.dirtyForms) {
                $("form").dirtyForms("setClean");
                $(".dirty").removeClass("dirty");
              }

              // $state.go('app.complaints', { status: 'open' });
              $state.go("app.patient_records_patient", {
                patientId: ctrl.patientId,
              });
            })
            .catch((err) => {
              toastr.error("Unable to save the Medical Order.");
            })
            .then(function () {
              $rootScope.unmaskLoading();
            });
        }
      }
    };

    /*================   UTILITY FUNCTIONS   ===================*/

    $scope.$watch(
      function () {
        return ctrl.mentalStatusKeyValue[ctrl?.mentalStatusKeyValue?.length - 1]
          .value;
      },
      function (newVal, oldVal) {
        if (newVal !== oldVal) {
          if (newVal) {
            ctrl.refreshotherMentalStatus();
          } else {
            // Handle the case when the "Others" checkbox is unchecked
            // Delete or clear the otherMentalStatus value
            //delete ctrl.medicalOrderForm.otherMentalStatus;
          }
        }
      }
    );

    function setupWatch() {
      $scope.$watch(
        function () {
          return ctrl.medicalOrderForm;
        },
        function (newValue, oldValue) {
          if (newValue != oldValue) {
            $rootScope.isFormDirty = true;
          }
        },
        true
      );
    }

    ctrl.resetForm = function () {
      ctrl.activityOptionsKeyValue = [
        { key: "Complete Bedrest" },
        { key: "Bedrest BRP" },
        { key: "Up As Tolerated" },
        { key: "Transfer Bed/Chair" },
        { key: "Exercise Prescribed" },
        { key: "Partial Weight Bearing" },
        { key: "Independent At Home" },
        { key: "Crutches" },
        { key: "Cane" },
        { key: "Wheelchair" },
        { key: "Walker" },
        { key: "No Restrictions" },
      ];
      ctrl.mentalStatusKeyValue = [
        { key: "Oriented", value: false },
        { key: "Comatose", value: false },
        { key: "Forgetful", value: false },
        { key: "Depressed", value: false },
        { key: "Disoriented", value: false },
        { key: "Lethargic", value: false },
        { key: "Agitated", value: false },
        { key: "Others", value: false },
      ];
      ctrl.activityOtherText = "";
      ctrl.otheractivityCheckbox = false;
      ctrl.medicalOrderForm = {
        orders: [{ discipline: "", frequency: "", duration: "" }],
        otherMentalStatus: "",
      };

      ctrl.refreshotherMentalStatus();
      ctrl.refreshactivitys();

      ctrl.generateFormCall();
    };
  }
  angular
    .module("xenon.controllers")
    .controller("MedicalOrdersCtrl", [
      "$rootScope",
      "$formService",
      "$filter",
      "PatientDAO",
      "PatientRecordDAO",
      "$state",
      "$stateParams",
      "$http",
      "$sce",
      "$window",
      "$timeout",
      "$scope",
      MedicalOrdersCtrl,
    ]);
})();
