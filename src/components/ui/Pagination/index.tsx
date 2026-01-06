import React, { useMemo } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface PaginationProps {
    onChange: (page: number) => void;
    currentPage: number;
    totalRows: number;
    rowsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
    onChange,
    currentPage,
    totalRows,
    rowsPerPage,
}) => {
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const maxVisiblePages = 20; // Número máximo de páginas visibles

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onChange(page);
        }
    };

    // Calcular qué páginas mostrar
    const visiblePages = useMemo(() => {
        if (totalPages <= maxVisiblePages) {
            // Si hay menos páginas que el máximo, mostrar todas
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);

        // Si estamos cerca del inicio
        if (currentPage <= halfVisible + 1) {
            // Mostrar primeras páginas
            for (let i = 1; i <= maxVisiblePages; i++) {
                pages.push(i);
            }
            if (totalPages > maxVisiblePages) {
                pages.push('...');
                pages.push(totalPages);
            }
        }
        // Si estamos cerca del final
        else if (currentPage >= totalPages - halfVisible) {
            pages.push(1);
            if (totalPages > maxVisiblePages) {
                pages.push('...');
            }
            // Mostrar últimas páginas
            for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        // Si estamos en el medio
        else {
            pages.push(1);
            pages.push('...');
            // Mostrar páginas centradas alrededor de la actual
            const start = currentPage - halfVisible + 1;
            const end = currentPage + halfVisible - 1;
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages, maxVisiblePages]);

    return (
        <div className="flex items-center justify-center p-4 bg-white border-t border-gray-200">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-200 hover:text-white rounded-md hover:bg-[#000B7E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
                <FaArrowLeft />
            </button>
            <div className="flex items-center mx-4 flex-wrap justify-center gap-1">
                {visiblePages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-gray-500 font-medium"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                                currentPage === pageNumber
                                    ? 'bg-[#000B7E] text-white hover:bg-[#000B7E]'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } flex items-center justify-center`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-200 hover:text-white rounded-md hover:bg-[#000B7E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
                <FaArrowRight />
            </button>
        </div>
    );
};

export default Pagination;
