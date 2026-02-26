import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'

type SalesByCategoriesProps = {
    data?: {
        labels: string[]
        data: number[]
        colors: string[]
    }
}

const SalesByCategories = ({
    data = { labels: [], data: [], colors: [] },
}: SalesByCategoriesProps) => {
    return (
        <Card className="shadow-none border-0 p-0 h-full">
            <div className="h-full">
                {data.data.length > 0 && (
                    <div className="h-full grid grid-cols-[58%_42%] items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <Chart
                                donutTitle={`${data.data.reduce((a, b) => a + b, 0)}`}
                                donutText="Cantidad de Talleres"
                                series={data.data}
                                customOptions={{
                                    labels: data.labels,
                                    legend: { show: false },
                                    colors: data.colors.length
                                        ? data.colors
                                        : COLORS,
                                }}
                                type="donut"
                                height={190}
                            />
                        </div>
                        {data.data.length === data.labels.length && (
                            <div className="min-w-0 space-y-2">
                                {data.labels.map((value, index) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Badge
                                            badgeStyle={{
                                                backgroundColor: data.colors[index] || COLORS[index],
                                            }}
                                        />
                                        <span className="text-xs font-semibold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SalesByCategories;
