export function validateMatchDate(
  tournamentStartDate: Date,
  tournamentEndDate: Date,
  matchDate: Date
) {
  if (matchDate < tournamentStartDate) {
    return "Match cannot start before tournament starts";
  }

  if (matchDate > tournamentEndDate) {
    return "Match cannot start after tournament ends";
  }

  return null;
}