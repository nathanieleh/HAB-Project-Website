export default function TopBar({forecasts}) {
    return (
        <div className="flex items-center justify-between p-4 bg-components/40 text-white rounded divide-x">
            {forecasts.map((item, index) => (
                <div key={index} className="px-4 text-center">
                    <div className="text-sm font-bold">{item.day}</div>
                    <div className="text-lg">{item.value}%</div>
                </div>
            ))}
        </div>
    );
}