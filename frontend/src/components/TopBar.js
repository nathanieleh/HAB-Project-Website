// forecasts should be in the format:
// let forecasts = [
//     { day: 'Mon', value: 70 },
//     { day: 'Tue', value: 60 },
//     { day: 'Wed', value: 65 },
//     { day: 'Thu', value: 75 },
//     { day: 'Fri', value: 80 },
//     { day: 'Sat', value: 90 },
//     { day: 'Sun', value: 85 }
// ]
export default function TopBar({ forecasts }) {
    return (
        <div className="flex items-center justify-between w-5xl p-4 bg-primary/40 text-white rounded divide-x">
            {forecasts.map((item, index) => (
                <div key={index} className="flex-1 px-4 text-center">
                    <div className="text-sm font-bold">{item.day}</div>
                    <div className="text-lg">{item.value}%</div>
                </div>
            ))}
        </div>
    );
}