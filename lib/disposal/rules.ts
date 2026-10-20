import { getCanonicalItem, type MaterialGroup, type WasteStream } from "@/lib/taxonomy";

export type DisposalGuidance = {
  wasteStream: WasteStream;
  headline: string;
  steps: string[];
  warnings: string[];
  scope: "general" | "local";
  sourceNote: string;
};

const SOURCE_NOTE =
  "General guidance for Indonesia. Check your school or local waste service before disposing.";

type RuleBody = {
  headline: string;
  steps: string[];
  warnings: string[];
  wasteStream?: WasteStream;
};

const GROUP_RULES: Record<MaterialGroup, RuleBody> = {
  plastic: {
    headline: "Rinse, dry, and check the resin code",
    steps: [
      "Empty and rinse the item.",
      "Dry it before placing it in recycling.",
      "Check the number inside the recycling triangle.",
    ],
    warnings: ["Check the resin code and your local rules before recycling."],
  },
  glass: {
    headline: "Rinse glass and keep it separate",
    steps: [
      "Empty and rinse the item.",
      "Remove caps and lids.",
      "Handle broken glass carefully.",
    ],
    warnings: ["Broken glass should be wrapped and placed in residual waste."],
  },
  metal: {
    headline: "Empty and rinse metal containers",
    steps: [
      "Empty all contents.",
      "Rinse and dry the item.",
      "Keep sharp edges away from the opening.",
    ],
    warnings: ["Aerosol cans may be hazardous if they are not fully empty."],
  },
  paper: {
    headline: "Keep paper clean and dry",
    steps: [
      "Remove food residue.",
      "Flatten boxes to save space.",
      "Keep the paper dry.",
    ],
    warnings: ["Greasy or wet paper belongs in residual waste."],
  },
  organic: {
    headline: "Keep organic waste separate",
    steps: [
      "Remove packaging.",
      "Drain excess liquid.",
      "Place it in the organic bin if your school has one.",
    ],
    warnings: ["Some compost systems do not accept meat or dairy."],
  },
  textile: {
    headline: "Reuse first, then use a textile drop-off",
    steps: [
      "Check if the item can be donated or repaired.",
      "Wash and dry it.",
      "Use a textile collection point if one is available.",
    ],
    warnings: ["Wet or moldy textiles usually cannot be recycled."],
  },
  electronic: {
    headline: "Take e-waste to a collection point",
    steps: [
      "Do not place it in household bins.",
      "Remove personal data from devices.",
      "Take it to an e-waste drop-off.",
    ],
    warnings: ["Lithium batteries can catch fire if they are damaged."],
  },
  hazardous: {
    headline: "Handle hazardous waste separately",
    steps: [
      "Do not place it in household bins.",
      "Keep it away from children and pets.",
      "Take it to a hazardous waste drop-off.",
    ],
    warnings: ["Never puncture, crush, or burn hazardous items."],
  },
  rubber: {
    headline: "Check for a special drop-off",
    steps: [
      "Keep it separate from general waste.",
      "Ask your school or local service about rubber collection.",
    ],
    warnings: ["Tires and large rubber items usually need a special drop-off."],
  },
  wood: {
    headline: "Reuse wood or use a special drop-off",
    steps: [
      "Check if the wood can be reused.",
      "Remove nails and screws.",
      "Use a bulky waste or special drop-off service.",
    ],
    warnings: ["Treated or painted wood may not be accepted."],
  },
  ceramic: {
    headline: "Ceramic usually goes to residual waste",
    steps: [
      "Wrap broken pieces safely.",
      "Place them in residual waste unless a special collection exists.",
    ],
    warnings: ["Ceramic is not glass and is usually not accepted in glass recycling."],
  },
  composite: {
    headline: "Check local rules for composite packaging",
    steps: [
      "Separate components if possible.",
      "Check the packaging label.",
      "Use residual waste if no recycling route exists.",
    ],
    warnings: ["Composite materials are hard to recycle."],
  },
  other: {
    headline: "Check local rules",
    steps: [
      "Look for a recycling or drop-off label.",
      "Ask your school or local waste service.",
    ],
    warnings: ["When in doubt, do not put it in recycling."],
  },
};

const ITEM_OVERRIDES: Record<string, Partial<RuleBody>> = {
  "plastic-bag": {
    headline: "Return plastic bags to a store drop-off",
    steps: [
      "Empty and clean the bag.",
      "Check for a store drop-off point.",
      "Use residual waste if no drop-off exists.",
    ],
    warnings: ["Do not put plastic bags in curbside recycling."],
    wasteStream: "special_dropoff",
  },
  "plastic-film": {
    headline: "Plastic film needs a special drop-off",
    steps: [
      "Clean and dry the film.",
      "Collect it with other soft plastics.",
      "Use a store or school drop-off if available.",
    ],
    warnings: ["Loose film can jam recycling machinery."],
    wasteStream: "special_dropoff",
  },
  styrofoam: {
    headline: "Styrofoam usually goes to residual waste",
    steps: [
      "Remove food residue.",
      "Place it in residual waste unless a special collection exists.",
    ],
    warnings: ["Styrofoam breaks into small pieces and is hard to recycle."],
    wasteStream: "landfill",
  },
  "paper-cup": {
    headline: "Paper cups are usually residual waste",
    steps: [
      "Empty the cup.",
      "Remove the lid and straw.",
      "Use residual waste unless your service accepts coated cups.",
    ],
    warnings: ["Most paper cups have a plastic lining."],
    wasteStream: "landfill",
  },
  "glass-scrap": {
    headline: "Wrap broken glass and use a special drop-off",
    steps: [
      "Wrap the glass in thick paper.",
      "Label it as broken glass.",
      "Use a special drop-off if available.",
    ],
    warnings: ["Never place loose broken glass in a bin."],
    wasteStream: "special_dropoff",
  },
  battery: {
    headline: "Tape the terminals and use a battery drop-off",
    steps: [
      "Tape both terminals with clear tape.",
      "Keep it away from metal objects.",
      "Take it to a battery or hazardous waste drop-off.",
    ],
    warnings: ["Damaged batteries can catch fire."],
    wasteStream: "hazardous",
  },
  "light-bulb": {
    headline: "Use a hazardous waste drop-off",
    steps: [
      "Wrap the bulb to prevent breakage.",
      "Do not place it in glass recycling.",
      "Take it to a hazardous waste drop-off.",
    ],
    warnings: ["Fluorescent bulbs contain mercury."],
    wasteStream: "hazardous",
  },
  "medical-waste": {
    headline: "Use a medical waste drop-off",
    steps: [
      "Keep it separate from household waste.",
      "Place sharps in a rigid container.",
      "Follow your school or local medical waste guidance.",
    ],
    warnings: ["Do not handle unknown sharps."],
    wasteStream: "hazardous",
  },
  "aerosol-can": {
    headline: "Check before disposing of aerosol cans",
    steps: [
      "Make sure the can is empty.",
      "Do not puncture or burn it.",
      "Follow local hazardous waste guidance.",
    ],
    warnings: ["Pressurized cans can explode if they are crushed."],
    wasteStream: "hazardous",
  },
  "composite-packaging": {
    headline: "Composite packaging needs local checking",
    steps: [
      "Separate what you can.",
      "Check the label for material codes.",
      "Use residual waste if no recycling route exists.",
    ],
    warnings: ["Mixed materials are usually not recyclable."],
    wasteStream: "unknown",
  },
  "e-waste": {
    headline: "Take electronics to an e-waste drop-off",
    steps: [
      "Back up and erase personal data.",
      "Remove batteries if possible.",
      "Take it to an e-waste collection point.",
    ],
    warnings: ["Do not put electronics in household bins."],
    wasteStream: "electronic",
  },
  cable: {
    headline: "Cables are e-waste",
    steps: [
      "Coil the cable.",
      "Keep it separate from general waste.",
      "Take it to an e-waste drop-off.",
    ],
    warnings: ["Copper cables can be recycled, but only at e-waste points."],
    wasteStream: "electronic",
  },
  wood: {
    headline: "Reuse wood or use a special drop-off",
    steps: [
      "Check if the wood can be reused.",
      "Remove nails and screws.",
      "Use a bulky waste or special drop-off service.",
    ],
    warnings: ["Treated or painted wood may not be accepted."],
    wasteStream: "special_dropoff",
  },
  rubber: {
    headline: "Check for a rubber drop-off",
    steps: [
      "Keep it separate from general waste.",
      "Ask your school or local service about rubber collection.",
    ],
    warnings: ["Tires and large rubber items usually need a special drop-off."],
    wasteStream: "special_dropoff",
  },
};

export function getDisposalGuidance(
  canonicalItem: string,
  materialGroup: MaterialGroup,
): DisposalGuidance {
  const item = getCanonicalItem(canonicalItem);
  const groupRule = GROUP_RULES[materialGroup] ?? GROUP_RULES.other;
  const override = ITEM_OVERRIDES[canonicalItem] ?? {};
  const wasteStream =
    override.wasteStream ?? item?.defaultWasteStream ?? groupRule.wasteStream ?? "unknown";

  return {
    wasteStream,
    headline: override.headline ?? groupRule.headline,
    steps: override.steps ?? groupRule.steps,
    warnings: override.warnings ?? groupRule.warnings,
    scope: "general",
    sourceNote: SOURCE_NOTE,
  };
}
