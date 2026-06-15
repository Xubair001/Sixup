import { client } from "./client";

export interface Poll {
  id: number;
  match_id: number;
  deadline: string | null;
  created_at: string;
}

export interface AvailabilityResponse {
  id: number;
  poll_id: number;
  user_id: number;
  status: string;
  responded_at: string;
}

export interface PollWithResponses {
  poll: Poll;
  responses: AvailabilityResponse[];
  available: number;
  unavailable: number;
  maybe: number;
}

export const availabilityApi = {
  createPoll: (matchId: number, deadline?: string) =>
    client.post<Poll>("/availability/polls", { match_id: matchId, deadline }).then((r) => r.data),

  getPoll: (matchId: number) =>
    client.get<PollWithResponses>(`/availability/polls/${matchId}`).then((r) => r.data),

  respond: (matchId: number, status: string) =>
    client.post<AvailabilityResponse>(`/availability/polls/${matchId}/respond`, { status }).then((r) => r.data),
};
