import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/configs/firebaseAssets.config';
import Card from '@/components/ui/Card';
import SalesByCategories from './components/SalesByCategories'
import SalesDashboardHeader from './components/SalesDashboardHeader';

const fetchDashboardData = async () => {
    const usersSnapshot = await getDocs(collection(db, 'Usuarios'));
    const subsSnapshot = await getDocs(collection(db, 'Subscripciones'));

    let clientesCount = 0;
    let tallerCount = 0;
    let talleresStats = { aprobados: 0, pendientes: 0, rechazados: 0, espera: 0 };
    let subscripcionesCount = 0;
    let totalMonto = 0;

    // Procesar usuarios y talleres
    usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.typeUser === 'Cliente') {
            clientesCount++;
        }
        if (data.typeUser === 'Taller') {
            tallerCount++;
            switch (data.status) {
                case 'Aprobado':
                    talleresStats.aprobados++;
                    break;
                case 'Pendiente':
                    talleresStats.pendientes++;
                    break;
                case 'Rechazado':
                    talleresStats.rechazados++;
                    break;
                case 'En espera por aprobación':
                    talleresStats.espera++;
                    break;
                default:
                    break;
            }
        }
    });

    // Procesar subscripciones
    subsSnapshot.forEach(doc => {
        const data = doc.data();
        totalMonto += data.monto || 0;
    });
    subscripcionesCount = subsSnapshot.size;

    return {
        clientesCount,
        tallerCount,
        talleresStats,
        subscripcionesCount,
        totalMonto,
    };
};

const SalesDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        clientesCount: 0,
        tallerCount: 0,
        talleresStats: { aprobados: 0, pendientes: 0, rechazados: 0, espera: 0 },
        subscripcionesCount: 0,
        totalMonto: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDashboardData();
                setDashboardData(data);
            } catch (error) {
                console.error('Error al obtener los datos del dashboard:', error);
            }
        };

        fetchData();
    }, []);

    const { 
        clientesCount, 
        tallerCount, 
        talleresStats, 
        subscripcionesCount, 
        totalMonto 
    } = dashboardData;

    // Datos para el gráfico
    const chartData = {
        labels: ['Aprobados', 'Pendientes', 'Rechazados', 'En espera por aprobación'],
        data: [
            talleresStats.aprobados,
            talleresStats.pendientes,
            talleresStats.rechazados,
            talleresStats.espera,
        ],
        colors: ['#15803D', '#FFC107', '#C22F1C', '#2196F3'],
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card 1 */}
                <Card className="hover:shadow-lg ease-in-out p-4">
                    <h5 className="text-gray-500 text-base font-semibold">Clientes</h5>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-4xl font-bold text-gray-900">{clientesCount}</p>
                    </div>
                    <p className="text-base text-gray-500 mt-2">Total de clientes</p>
                </Card>

                {/* Card 2 */}
                <Card className="hover:shadow-lg ease-in-out p-4">
                    <h5 className="text-gray-500 text-base font-semibold">Talleres</h5>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-4xl font-bold text-gray-900">{tallerCount}</p>
                        <span className="text-base font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                            {talleresStats.espera} en espera
                        </span>
                    </div>
                    <p className="text-base text-gray-500 mt-2">Total Talleres</p>
                </Card>

                {/* Card 3 */}
                <Card className="hover:shadow-lg ease-in-out p-4">
                    <h5 className="text-gray-500 text-base font-semibold">Subscripciones</h5>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-4xl font-bold text-gray-900">{subscripcionesCount}</p>
                        <span className="text-base font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            ${totalMonto.toFixed(2)} Total
                        </span>
                    </div>
                    <p className="text-base text-gray-500 mt-2">Subscripciones y monto total</p>
                </Card>
            </div>

            {/* Gráfico de pastel */}
            <div className="mt-6">
                <SalesByCategories data={chartData} />
            </div>
        </div>
    );
};

export default SalesDashboard;
