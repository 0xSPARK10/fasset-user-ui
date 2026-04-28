import { useQuery } from "@tanstack/react-query";
import { ITagsByAddress, ITagReservationFee } from "@/types";
import apiClient from "./apiClient";

export const TAGS_KEY = {
    USER_TAGS: 'tags.userTags',
    TAG: 'tags.tag',
    RESERVATION_FEE: 'tags.reservationFee',
}

export function useTag(fasset: string, tagId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [TAGS_KEY.TAG, fasset, tagId],
        queryFn: async (): Promise<ITagsByAddress> => {
            const response = await apiClient.get(`tag/${fasset}/${tagId}`);
            return response.data as ITagsByAddress;
        },
        enabled: enabled && !!tagId,
    });
}

export function useUserTags(fasset: string, address: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [TAGS_KEY.USER_TAGS, fasset, address],
        queryFn: async (): Promise<ITagsByAddress[]> => {
            const response = await apiClient.get(`tags/${fasset}/${address}`);
            return response.data as ITagsByAddress[];
        },
        enabled: enabled && !!address,
    });
}

export function useTagReservationFee(fasset: string, enabled: boolean = true) {
    return useQuery({
        queryKey: [TAGS_KEY.RESERVATION_FEE, fasset],
        queryFn: async (): Promise<ITagReservationFee> => {
            const response = await apiClient.get(`tagReservationFee/${fasset}`);
            return response.data as ITagReservationFee;
        },
        enabled: enabled,
    });
}
