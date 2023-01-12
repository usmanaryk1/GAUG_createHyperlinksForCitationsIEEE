'use strict';

angular.module('xenon.services', []).
	service('$menuItems', function()
	{
		this.menuItems = [];

		var $menuItemsRef = this;

		var menuItemObj = {
			parent: null,

			title: '',
			link: '', // starting with "./" will refer to parent link concatenation
			state: '', // will be generated from link automatically where "/" (forward slashes) are replaced with "."
			icon: '',

			isActive: false,
			label: null,

			menuItems: [],

			setLabel: function(label, color, hideWhenCollapsed)
			{
				if(typeof hideWhenCollapsed == 'undefined')
					hideWhenCollapsed = true;

				this.label = {
					text: label,
					classname: color,
					collapsedHide: hideWhenCollapsed
				};

				return this;
			},

			addItem: function(title, link, icon)
			{
				var parent = this,
					item = angular.extend(angular.copy(menuItemObj), {
						parent: parent,

						title: title,
						link: link,
						icon: icon
					});

				if(item.link)
				{
					if(item.link.match(/^\./))
						item.link = parent.link + item.link.substring(1, link.length);

					if(item.link.match(/^-/))
						item.link = parent.link + '-' + item.link.substring(2, link.length);

					item.state = $menuItemsRef.toStatePath(item.link);
				}

				this.menuItems.push(item);

				return item;
			}
		};

		this.addItem = function(title, link, icon)
		{
			var item = angular.extend(angular.copy(menuItemObj), {
				title: title,
				link: link,
				state: this.toStatePath(link),
				icon: icon
			});

			this.menuItems.push(item);

			return item;
		};

		this.getAll = function()
		{
			return this.menuItems;
		};

		this.prepareSidebarMenu = function()
		{
			var dashboard    = this.addItem('Dashboard', 		'/app/dashboard', 			'fa-home');
			var employee      = this.addItem('Employee',	'/app',	'linecons-cog');
			var patient  = this.addItem('Patient', 		'/app', 					'linecons-user');
			var timeSheet  	 = this.addItem('Time Sheet', 			'/app', 			'linecons-clock');
			var insuranceProvider  	 = this.addItem('Insurance Provider', 			'/app', 			'fa fa-umbrella');
			var billing  	 = this.addItem('Billing', 			'/app', 				'linecons-money');
			var payroll  	 = this.addItem('Payroll', 			'/app', 				'linecons-wallet');
			var company  	 = this.addItem('Company', 			'/app', 				'linecons-key');

				// Subitems of Dashboard
				// dashboard.addItem('Dashboard 1', 	'-/variant-1'); // "-/" will append parents link

				// Subitems of employee
				employee.addItem('Add Employee', 				'./employee/tab1/');
				employee.addItem('View Employee', 				'./employee-list/active');


				// Subitems of patient
				patient.addItem('Add Patient',		'./patient/tab1');
				patient.addItem('View Patient',		'./patient-list/active');


				// Subitems of timeSheet
				timeSheet.addItem('Employee Timesheet', 			'./employee_timesheet');
				// timeSheet.addItem('Edit Timesheet', 			'./edit_timesheet');
				timeSheet.addItem('Manual Punch', 			'./manual_punch');
				timeSheet.addItem('Daily Attendance', 			'./daily_attendance');
				timeSheet.addItem('Patient Timesheet', 			'./patient_time_sheet');


				// Subitems of insuranceProvider
				insuranceProvider.addItem('Add Insurance Provider',		'./add_inusrer');
				insuranceProvider.addItem('View Insurance Provider',	'./view_insurer');

				// Subitems of billing
				billing.addItem('Billing Session',		'./billing_tab_1');
				billing.addItem('Billing History',	'./biling_history');

				// Subitems of payroll
				// payroll.addItem('Pay Rates', 			'./pay_rates');
				payroll.addItem('Payroll History', 			'./payroll_history');
				// payroll.addItem('Payroll Review', 			'./payroll_review');
				payroll.addItem('Payroll Session', 			'./payroll_session');
				payroll.addItem('Payroll Settings', 			'./payroll_settings');

				// Subitems of company
				company.addItem('Company Information', 			'./company_information');

			return this;
		};

		this.prepareHorizontalMenu = function()
		{
			var dashboard    = this.addItem('Dashboard', 		'/app/dashboard-variant-1', 			'fa-home');
			var employee      = this.addItem('Employee',	'/app',	'linecons-cog');
			var patient  = this.addItem('Patient', 		'/app', 					'linecons-user');
			var timeSheet  	 = this.addItem('Time Sheet', 			'/app', 			'linecons-clock');
			var insuranceProvider  	 = this.addItem('Insurance Provider', 			'/app', 			'fa fa-umbrella');
			var billing  	 = this.addItem('Billing', 			'/app', 				'linecons-user');

			// var dashboard    = this.addItem('Dashboard', 		'/app/dashboard', 			'linecons-cog');
			// var employee      = this.addItem('Employee',	'/app/layout-and-skins',	'linecons-desktop');
			// var patient  = this.addItem('Patient', 		'/app/patient', 					'linecons-note');
			// var timeSheet  	 = this.addItem('Time Sheet', 			'/app/timeSheet', 			'linecons-star');
			// var insuranceProvider  	 = this.addItem('Insurance Provider', 			'/app/mailbox', 			'linecons-mail').setLabel('5', 'secondary', false);
			// var billing  	 = this.addItem('Billing', 			'/app/tables', 				'linecons-database');


				// Subitems of employee
				employee.addItem('Add Employee', 				'./employee/tab1');
//				employee.addItem('Add Employee', 				'./add_employee_tab_2');
//				employee.addItem('Add Employee', 				'./add_employee_tab_3');
				employee.addItem('View Employee', 				'./view_employee');


				// Subitems of patient
				patient.addItem('Add Patient',		'./patient/tab1');
				patient.addItem('View Patient',		'./view_patient_tab_1');


				// Subitems of timeSheet
				timeSheet.addItem('Edit Timesheet', 			'./edit_timesheet');


				// Subitems of insuranceProvider
				insuranceProvider.addItem('Add Insurance Provider',		'./add_inusrer');
				insuranceProvider.addItem('View Insurance Provider',	'./view_insurer');

				// Subitems of billing
				billing.addItem('Billing Session',		'./billing_tab_1');
				billing.addItem('Billing History',	'./biling_history');


			return this;
		}

		this.instantiate = function()
		{
			return angular.copy( this );
		}

		this.toStatePath = function(path)
		{
			return path.replace(/\//g, '.').replace(/^\./, '');
		};

		this.setActive = function(path)
		{
			this.iterateCheck(this.menuItems, this.toStatePath(path));
		};

		this.setActiveParent = function(item)
		{
			item.isActive = true;
			item.isOpen = true;

			if(item.parent)
				this.setActiveParent(item.parent);
		};

		this.iterateCheck = function(menuItems, currentState)
		{
			angular.forEach(menuItems, function(item)
			{
				if(item.state == currentState)
				{
					item.isActive = true;

					if(item.parent != null)
						$menuItemsRef.setActiveParent(item.parent);
				}
				else if(item.state.substr(0, item.state.length -1) == currentState.substr(0, currentState.length -1))
				{ // set tab1 is active when visiting tab2, tab3 
					item.isActive = true;

					if(item.parent != null)
						$menuItemsRef.setActiveParent(item.parent);
				}
				else
				{
					item.isActive = false;
					item.isOpen = false;

					if(item.menuItems.length)
					{
						$menuItemsRef.iterateCheck(item.menuItems, currentState);
					}
				}
			});
		}
	});