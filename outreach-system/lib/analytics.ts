export function generateSmartInsight(data: any) {
    if (!data) return "No data available.";

    if (data.type === 'categorical') {
        const sorted = [...data.data].sort((a: any, b: any) => b.value - a.value);
        if (sorted.length === 0) return "No responses yet.";

        const top = sorted[0];
        const percentage = Math.round((top.value / data.totalResponses) * 100);

        if (percentage >= 50) {
            return `The majority of patients (${percentage}%) reported '${top.name}' for ${data.label}.`;
        } else {
            return `Responses are widely distributed, with '${top.name}' being the most common (${percentage}%).`;
        }
    }

    if (data.type === 'numerical') {
        if (!data.stats) return "No stats available.";
        return `The average ${data.label} is ${Math.round(data.stats.average)}, with a range between ${data.stats.min} and ${data.stats.max}.`;
    }

    return "Analysis available.";
}
