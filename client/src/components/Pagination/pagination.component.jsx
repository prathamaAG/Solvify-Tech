import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination as MuiPagination, PaginationItem } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const Pagination = ({ pageInformation, page, setPage, totalPages }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Function to update searchParams while preserving other query parameters
    const updatePageParam = (newPage) => {
        const currentParams = Object.fromEntries(searchParams.entries());
        const updatedParams = {
            ...currentParams,
            pageno: newPage,
        };
        setSearchParams(new URLSearchParams(updatedParams));
    };

    return (
        pageInformation && totalPages > 1 && (
            <MuiPagination
                count={totalPages}
                page={page}
                onChange={(event, value) => {
                    setPage(value);
                    updatePageParam(value);
                }}
                sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
                shape="rounded"
                renderItem={(item) => (
                    <PaginationItem
                        {...item}
                        components={{ previous: ArrowBackIos, next: ArrowForwardIos }}
                    />
                )}
            />
        )
    );
};

export default Pagination;
