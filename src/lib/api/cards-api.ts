// lib/api/cards-api.ts

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

    return response.data.cards;
  };

  const DELETE_CARD = async (id: string) => {
  return await request({
    url: `/card/delete-card-by-admin/${id}`, // ✅ ID in the URL path
    method: "DELETE",
  });
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
    DELETE_CARD,
    UPDATE_CARD,
  };
};
