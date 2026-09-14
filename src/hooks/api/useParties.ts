import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createParty, deleteParty, getParties, getParty, getPartyLedger, getPartyStats, updateParty } from "@/services/parties.services";
// import { Party } from "@/app/(dashboard)/parties/new/page";

export const useCreateParty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
        }
    });
};

export const usePartyStats = () =>{
    return useQuery({
        queryKey:['party-stats'],
        queryFn: getPartyStats,
    })
}
export const useParties = (filter: { type?: 'customer' | 'supplier' | 'all',includeWalkIn?:boolean, search?: string, page?:number, limit?: number } = {}) => {
    return useQuery({
        queryKey: ['parties', filter],
        queryFn: () => getParties(filter),
        placeholderData: (previousData) => previousData,
        select: data => data.data
    })
}

export const useParty = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['party', id],
        queryFn: () => getParty(id),
        ...options
    })
}

export const usePartyLedger = (
    id: string,
    params?: { page?: number; limit?: number; search?: string; sort?: string },
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['partyLedger', id, params],
        queryFn: () => getPartyLedger(id, params),
        placeholderData: (previousData) => previousData,
        ...options
    })
}

export const useDeleteParty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
        }
    })
}

export const useUpdateParty = (id:string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['party',id] });
            
        }
    })
}