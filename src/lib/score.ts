type ProofForScore = {
  status: string;
  weight: number;
};

export function calculateScore(
  proofs: ProofForScore[]
): number {
  if (proofs.length === 0) {
    return 0;
  }

  const totalWeight = proofs.reduce(
    (sum, proof) => sum + proof.weight,
    0
  );

  if (totalWeight === 0) {
    return 0;
  }

  const acceptedWeight = proofs
    .filter((proof) => proof.status === "ACCEPTED")
    .reduce(
      (sum, proof) => sum + proof.weight,
      0
    );

  return Math.min(
    100,
    Math.round(
      (acceptedWeight / totalWeight) * 100
    )
  );
}