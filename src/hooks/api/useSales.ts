import { createSales, getSaleById, getSales, getSalesSummary } from "@/services/sales.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useCreateSales = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSales,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
        }
    })
}

export const useGetSales = (filter: { search?: string, partyId?: string,limit?:number,page?:number } = {}) => {
    return useQuery({
        queryKey: ['sales', filter],
        queryFn: () => getSales(filter)
    })
}

export const useGetSalesSummary = () => {
    return useQuery({
        queryKey: ['sales', 'summary'],
        queryFn: getSalesSummary,
        select: data => data.data
    })
}

export const useGetSaleById = (id: string) => {
    return useQuery({
        queryKey: ['sales', id],
        queryFn: () => getSaleById(id),
        enabled: !!id,
    })
}



