
#!/bin/bash

# Check if the correct number of arguments is provided
if [ $# -ne 2 ]; then
    echo "Usage: ./message.sh <dd-mm> <message>"
    exit 1
fi

# Extract arguments
DATE=$1
MESSAGE=$2

# Extract day and month from the date
DD=$(echo $DATE | cut -d'-' -f1)
MM=$(echo $DATE | cut -d'-' -f2)

# Check if the date parts are valid numbers
if ! [[ "$DD" =~ ^[0-9]+$ ]] || ! [[ "$MM" =~ ^[0-9]+$ ]]; then
    echo "Invalid date format. Please provide the date in dd-mm format."
    exit 1
fi

# Set the author and committer dates
export GIT_AUTHOR_DATE="2024-$MM-$DD"T12:00:00
export GIT_COMMITTER_DATE="2024-$MM-$DD"T12:00:00

# Stage, commit, and push the changes
git add .
git commit -m "$MESSAGE functionality"
git push