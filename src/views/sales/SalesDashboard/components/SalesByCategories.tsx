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
        <Card>
            <div className="mt-6">
                {data.data.length > 0 && (
                    <>
                        <Chart
                            donutTitle={`${data.data.reduce((a, b) => a + b, 0)}`}
                            donutText="Cantidad de Talleres" // Texto personalizado
                            series={data.data}
                            customOptions={{
                                labels: data.labels,
                                colors: data.colors.length
                                    ? data.colors
                                    : COLORS, // Usa colores personalizados o predeterminados
                            }}
                            type="donut"
                        />
                        {data.data.length === data.labels.length && (
                            <div className="mt-6 grid grid-cols-2 gap-4 max-w-[180px] mx-auto">
                                {data.labels.map((value, index) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-1"
                                    >
                                        <Badge
                                            badgeStyle={{
                                                backgroundColor: data.colors[index] || COLORS[index],
                                            }}
                                        />
                                        <span className="font-semibold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

export default SalesByCategories;
