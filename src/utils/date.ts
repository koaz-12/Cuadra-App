export const getFinancialMonthStartDate = (financialStartDay: number = 1): Date => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let startMonth = currentMonth;
    let startYear = currentYear;

    if (currentDay < financialStartDay) {
        // If we haven't reached the start day yet, the financial month started last month
        startMonth--;
        if (startMonth < 0) {
            startMonth = 11;
            startYear--;
        }
    }

    const startDate = new Date(startYear, startMonth, financialStartDay);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
};
