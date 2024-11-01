import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Asegúrate de instalar react-icons

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

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onChange(page);
        }
    };

    return (
        <div className="flex items-center justify-center p-4 bg-white border-t border-gray-200">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-6 h-6 text-gray-700 bg-gray-200  hover:text-white rounded-md hover:bg-[#000B7E] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <FaArrowLeft />
            </button>
            <div className="flex items-center mx-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === index + 1
                                ? 'bg-[#000B7E] text-white w-6 h-6 flex items-center justify-center'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 w-6 h-6 flex items-center justify-center'
                        } mx-2`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-6 h-6 text-gray-700 bg-gray-200  hover:text-white rounded-md hover:bg-[#000B7E] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <FaArrowRight />
            </button>
        </div>
    );
};

export default Pagination;
