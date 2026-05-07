import Chart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/configs/firebaseAssets.config';
import { COLORS } from '@/constants/chart.constant';
import { Timestamp } from 'firebase/firestore';
import DatePicker from '@/components/ui/DatePicker';

type SubscriptionData = {
    fechaCreacion?: Timestamp;
    comprobante_pago?: string;
    fecha_inicio?: Timestamp;
    nombre?: string;
    plan?: string;
    plan_name?: string;
    plan_nombre?: string;
    nombre_plan?: string;
    tipo_plan?: string;
    pagado?: boolean;
    status_pago?: string;
    estado_pago?: string;
};

const SplineArea = () => {
    const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        const getSubscriptionPlan = (sub: SubscriptionData) => {
            const planFields = [
                sub.nombre,
                sub.plan,
                sub.plan_name,
                sub.plan_nombre,
                sub.nombre_plan,
                sub.tipo_plan,
            ];
            const planName = planFields.find(
                (field) => typeof field === 'string' && field.trim().length > 0,
            );
            return planName?.trim() || 'Sin plan';
        };

        const isPaidSubscription = (sub: SubscriptionData) => {
            const planName = getSubscriptionPlan(sub).toLowerCase();
            if (planName === 'gratis') {
                return false;
            }

            if (planName.length > 0) {
                return true;
            }

            if (
                typeof sub.comprobante_pago === 'string' &&
                sub.comprobante_pago.trim().length > 0
            ) {
                return true;
            }

            if (typeof sub.pagado === 'boolean') {
                return sub.pagado;
            }

            const paymentStatus = String(sub.status_pago || sub.estado_pago || '')
                .toLowerCase()
                .trim();

            return (
                paymentStatus.includes('pag') ||
                paymentStatus.includes('aprob') ||
                paymentStatus.includes('confirm')
            );
        };

        const fetchData = async () => {
            try {
                const subsSnapshot = await getDocs(collection(db, 'Subscripciones'));
                const subscriptions: SubscriptionData[] = subsSnapshot.docs.map((doc) => doc.data() as SubscriptionData);

                const today = new Date();
                let rangeStart = startDate
                    ? new Date(
                          startDate.getFullYear(),
                          startDate.getMonth(),
                          startDate.getDate(),
                          0,
                          0,
                          0,
                      )
                    : null;
                let rangeEnd = endDate
                    ? new Date(
                          endDate.getFullYear(),
                          endDate.getMonth(),
                          endDate.getDate(),
                          23,
                          59,
                          59,
                      )
                    : null;

                if (!rangeStart || !rangeEnd) {
                    rangeStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
                }

                if (rangeStart > rangeEnd) {
                    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
                }

                const getDateString = (date: Date) => date.toISOString().split('T')[0];
                const daysInRange: string[] = [];
                const cursor = new Date(rangeStart);
                while (cursor <= rangeEnd) {
                    daysInRange.push(getDateString(cursor));
                    cursor.setDate(cursor.getDate() + 1);
                }

                const totalsByDay: Record<string, number> = {};
                const freeByDay: Record<string, number> = {};
                const paidByPlanDay: Record<string, Record<string, number>> = {};

                daysInRange.forEach((day) => {
                    totalsByDay[day] = 0;
                    freeByDay[day] = 0;
                });

                subscriptions.forEach((sub) => {
                    const dateSource = sub.fecha_inicio || sub.fechaCreacion;
                    if (!dateSource) {
                        return;
                    }

                    const subDate = dateSource.toDate();
                    if (subDate < rangeStart! || subDate > rangeEnd!) {
                        return;
                    }

                    const dayKey = getDateString(subDate);
                    totalsByDay[dayKey] = (totalsByDay[dayKey] || 0) + 1;

                    if (!isPaidSubscription(sub)) {
                        freeByDay[dayKey] = (freeByDay[dayKey] || 0) + 1;
                    } else {
                        const plan = getSubscriptionPlan(sub);
                        if (!paidByPlanDay[plan]) {
                            paidByPlanDay[plan] = {};
                        }
                        paidByPlanDay[plan][dayKey] = (paidByPlanDay[plan][dayKey] || 0) + 1;
                    }
                });

                const baseSeries = [
                    { name: 'Subscripciones totales', data: daysInRange.map((day) => totalsByDay[day] || 0) },
                    { name: 'Subscripciones gratis', data: daysInRange.map((day) => freeByDay[day] || 0) },
                ];

                const planSeries = Object.entries(paidByPlanDay)
                    .sort((a, b) => {
                        const totalA = Object.values(a[1]).reduce((acc, value) => acc + value, 0);
                        const totalB = Object.values(b[1]).reduce((acc, value) => acc + value, 0);
                        return totalB - totalA;
                    })
                    .slice(0, 4)
                    .map(([plan, dataMap]) => ({
                        name: `Pagas ${plan}`,
                        data: daysInRange.map((day) => dataMap[day] || 0),
                    }));

                setSeries([...baseSeries, ...planSeries]);
                setCategories(daysInRange);
            } catch (error) {
                console.error('Error al obtener datos de subscripciones:', error);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50/80 p-2.5 flex-none">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Filtrar por fecha
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="text-[11px] font-semibold text-[#000B7E] hover:underline"
                    >
                        Limpiar
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-gray-600">
                            Desde
                        </span>
                        <DatePicker
                            value={startDate}
                            onChange={(value) => {
                                setStartDate(value);
                            }}
                            inputFormat="DD/MM/YYYY"
                            placeholder="Seleccionar fecha"
                            clearable
                            className="w-full"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-gray-600">
                            Hasta
                        </span>
                        <DatePicker
                            value={endDate}
                            onChange={(value) => {
                                setEndDate(value);
                            }}
                            inputFormat="DD/MM/YYYY"
                            placeholder="Seleccionar fecha"
                            clearable
                            className="w-full"
                        />
                    </label>
                </div>
            </div>
            <div className="flex-1 min-h-0 pb-2">
                <Chart
                    options={{
                        chart: { id: 'spline-area-chart' },
                        legend: {
                            position: 'bottom',
                            offsetY: -6,
                        },
                        grid: {
                            padding: {
                                bottom: 12,
                            },
                        },
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
                    height={200}
                />
            </div>
        </div>
    );
};

export default SplineArea;


