import Chart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/configs/firebaseAssets.config';
import { COLORS } from '@/constants/chart.constant';
import { Timestamp } from 'firebase/firestore';
import Button from '@/components/ui/Button'

type SubscriptionData = {
    fechaCreacion?: Timestamp;
    comprobante_pago?: string;
    fecha_inicio?: Timestamp;
};

const SplineArea = () => {
    const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [weekOffset, setWeekOffset] = useState(0); // Controlar la semana actual

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subsSnapshot = await getDocs(collection(db, 'Subscripciones'));
                const subscriptions: SubscriptionData[] = subsSnapshot.docs.map(doc => doc.data() as SubscriptionData);

                // Calcular rango de fechas
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - (today.getDay() + 7 * weekOffset));
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                const getDateString = (date: Date) => date.toISOString().split('T')[0];
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    return getDateString(date);
                });

                const dataByDay: Record<string, number> = {};
                const dataByComprobante: Record<string, number> = {};

                last7Days.forEach(day => {
                    dataByDay[day] = 0;
                    dataByComprobante[day] = 0;
                });

                subscriptions.forEach(sub => {
                    const dayKey = sub.fechaCreacion ? sub.fechaCreacion.toDate().toISOString().split('T')[0] : undefined;
                    const startDayKey = sub.fecha_inicio ? sub.fecha_inicio.toDate().toISOString().split('T')[0] : undefined;

                    if (dayKey && dataByDay[dayKey] !== undefined) {
                        dataByDay[dayKey]++;
                    }
                    if (startDayKey && sub.comprobante_pago && dataByComprobante[startDayKey] !== undefined) {
                        dataByComprobante[startDayKey]++;
                    }
                });

                const series1 = last7Days.map(day => dataByDay[day]);
                const series2 = last7Days.map(day => dataByComprobante[day]);

                setSeries([
                    { name: 'Subscripciones por día', data: series1 },
                    { name: 'Subscripciones con comprobante', data: series2 },
                ]);
                setCategories(last7Days);
            } catch (error) {
                console.error('Error al obtener datos de subscripciones:', error);
            }
        };

        fetchData();
    }, [weekOffset]); // Ejecutar cada vez que cambie el desplazamiento de la semana

    return (
        <div>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                    onClick={() => setWeekOffset(weekOffset + 1)} 
                    style={{ backgroundColor: '#000B7E' }} 
                    className="text-white hover:opacity-80"
                >
                        Semana Anterior
                </Button>
                <Button 
                    onClick={() => setWeekOffset(0)}
                    style={{ backgroundColor: '#000B7E' }} 
                    className="text-white hover:opacity-80"
                >
                        Semana Actual
                </Button>
                <Button 
                    onClick={() => setWeekOffset(weekOffset - 1)}
                    style={{ backgroundColor: '#000B7E' }} 
                    className="text-white hover:opacity-80"
                    >
                        Semana Siguiente
                </Button> 
            </div>
            <Chart
                options={{
                    chart: { id: 'spline-area-chart' },
                    dataLabels: { enabled: false },
                    colors: COLORS,
                    stroke: { curve: 'smooth' },
                    xaxis: {
                        type: 'datetime',
                        categories,
                        labels: {
                            formatter: function (value) {
                                const date = new Date(value);
                                return new Intl.DateTimeFormat('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                }).format(date);
                            },
                        },
                    },
                    tooltip: {
                        x: { format: 'yyyy-MM-dd' },
                    },
                }}
                series={series}
                type="area"
                height={300}
            />
        </div>
    );
};

export default SplineArea;


