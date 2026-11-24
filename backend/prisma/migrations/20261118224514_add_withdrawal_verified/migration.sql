-- AlterTable
-- Defaults to false (#393): existing self-reported withdrawal rows become
-- unverified retroactively, matching Donation.verified's same stance that a
-- client report is never trusted until independently confirmed.
ALTER TABLE "Withdrawal" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
