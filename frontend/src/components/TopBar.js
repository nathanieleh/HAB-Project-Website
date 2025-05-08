export default function TopBar({ forecasts, className }) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between w-[80vw] md:w-[90vw] p-4 bg-primary/40 text-white rounded-xl divide-x">
                {forecasts.map((item, index) => (
                    <div key={index} className="flex-1 px-4 text-center">
                        <div className="text-sm font-bold">{item.day}</div>
                        <div className="text-lg">{item.value / 10}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
}