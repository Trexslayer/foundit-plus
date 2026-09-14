export type ProofType =
  | "OWNER_PROOF"
  | "OWNER_SUGGESTION"
  | "FINDER_PROOF";

export type ProofStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CLARIFICATION";

export type ClaimStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export type VerificationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CLARIFICATION";

export type FoundItem = {
  id: string;
  finder_id: string;
  title: string;
  description: string;
  private_info: string | null;
  image_url: string | null;
  category: string | null;
  location: string | null;
  found_at: string | null;
  status: string;
  created_at: string;
};

export type Claim = {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string | null;
  score: number;
  status: ClaimStatus;
  created_at: string;
};

export type Proof = {
  id: string;
  item_id: string;
  claim_id: string | null;
  title: string;
  description: string;
  type: ProofType;
  status: ProofStatus;
  weight: number;
  image_url: string | null;
  created_at: string;
};

export type VerificationCheck = {
  id: string;
  item_id: string;
  finder_id: string;
  question: string;
  expected_answer?: string;
  created_at: string;
};

export type VerificationAnswer = {
  id: string;
  check_id: string;
  claim_id: string;
  answer: string;
  status: VerificationStatus;
  created_at: string;
};