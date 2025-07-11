import type { ICardResponse } from "@/types/cards-type";
import request from "./request";

export type CardQueryParams = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  nationality?: object;
};

export const requestCards = () => {
  const CARDS = async ({
    page,
    pageSize,
    sortBy,
    sortOrder,
  }: CardQueryParams): Promise<ICardResponse> => {
    const url = `/card/get-cards-by-admin?page=${page}&limit=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}&is_deleted=false`;

    const response = await request({
      url,
      method: "GET",
    });

    // ✅ FIX: extract the nested cards object
    return response.cards;
  };

  const UPDATE_CARD = async (id: string, status: boolean) => {
    return await request({
      url: `/card/update-card/${id}`,
      method: "PUT",
      data: {
        is_active: status,
      },
    });
  };

  return {
    CARDS,
    UPDATE_CARD,
  };
};
