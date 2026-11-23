// Desktop layout of the bridge page, shared by the page grid and the recovery notices above it.

// Picker + form side by side only from 1250px — below that the picker's TO header (address +
// destination tag) gets too narrow; Mantine has no breakpoint there
export const BRIDGE_WIDE_QUERY = "(min-width: 1250px)";

// Figma: picker : form ≈ 60 : 40, the form never under 510px — wide enough for the token name
// and the amount input side by side without truncating. The col's padding is half the gutter on
// each side, hence + gutter.
export const BRIDGE_FORM_COL_STYLE = { width: "max(calc(510px + var(--grid-gutter)), 40%)" };
