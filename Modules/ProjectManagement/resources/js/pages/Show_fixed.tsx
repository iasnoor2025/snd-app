// This is a temporary file to demonstrate the fix
// The issue is on line 633 where there's an extra space after })()}
// It should be:
//     })()}
// instead of:
//     })()}

// The correct Progress component should look like:
/*
<Progress
    value={(() => {
        const today = new Date();
        const endDate = new Date(project.end_date);
        const startDate = new Date(project.start_date);
        // Calculate total project duration in days
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        // Calculate days elapsed
        const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        // Calculate time progress percentage
        return totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;
    })()}
    className="h-3 bg-gray-100"
/>
*/
