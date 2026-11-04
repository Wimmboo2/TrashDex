import type { DisposalContext, DisposalGuidance, LocalOption, ScrapCollectorNote } from "@/lib/types";
import { getCanonicalItem, type MaterialGroup, type WasteStream } from "@/lib/taxonomy";

const SOURCE_NOTE =
  "Guidance is for Indonesia and is not a city or school regulation. Check local rules before you dispose of it.";

const CONTEXT_NOTES: Record<DisposalContext, string> = {
  school:
    "School note: use your school bins when they exist. Waste banks, 3R facilities, and hazardous drop-offs are for items the school does not take.",
  neighborhood:
    "Neighborhood note: ask a nearby waste bank or a 3R facility what they accept. This app does not know your area.",
};

type PlaceId = LocalOption["id"];

type PlaceDraft = {
  id: PlaceId;
  detail: string;
};

type ScrapDraft = ScrapCollectorNote;

type RuleBody = {
  headline: string;
  steps: string[];
  warnings: string[];
  wasteStream?: WasteStream;
  places?: PlaceDraft[];
  scrap?: ScrapDraft;
};

const PLACE_TITLES: Record<PlaceId, string> = {
  bank_sampah: "Waste bank",
  tps3r: "3R facility",
  b3_dropoff: "Hazardous drop-off",
};

const DEFAULT_SCRAP: ScrapDraft = {
  buys: "rarely",
  note: "Do not assume a scrap collector buys this. If they refuse, do not leave it with other recyclables.",
};

const GROUP_RULES: Record<MaterialGroup, RuleBody> = {
  plastic: {
    headline: "Rinse it, then ask a waste bank",
    steps: [
      "Empty and rinse off food or drink.",
      "Dry it and keep caps separate when they are a different plastic.",
      "Take clean, sorted plastic to a waste bank. Do not mix films and bottles in one sack.",
    ],
    warnings: ["A recycling number is not a promise that a local buyer accepts it."],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Some waste banks buy clean hard plastic, especially PET bottles. Each unit sets its own list.",
      },
      {
        id: "tps3r",
        detail:
          "A 3R facility may take plastic a waste bank refuses. That is sorted waste, not a guaranteed sale.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Scrap collectors often buy clean PET bottles. Other plastics sell less often, and dirty plastic is usually refused.",
    },
  },
  glass: {
    headline: "Rinse intact glass and keep it whole",
    steps: [
      "Empty and rinse the bottle or jar.",
      "Remove the cap or lid.",
      "Keep it intact. Wrap broken glass and keep shards out of a waste bank sack.",
    ],
    warnings: ["Broken glass belongs in residual waste, wrapped so nobody is cut."],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Some waste banks take intact bottles and jars. Payment is often low, and broken glass is usually refused.",
      },
      {
        id: "tps3r",
        detail: "Ask the 3R facility before leaving glass there. Broken glass needs to be wrapped.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Some scrap collectors take intact glass bottles. Many prefer metal and cardboard, and they rarely want broken glass.",
    },
  },
  metal: {
    headline: "Rinse the metal and keep it separate",
    steps: [
      "Empty and rinse the can or scrap.",
      "Fold in sharp edges or cover them.",
      "Separate aluminum from steel if you can tell them apart.",
    ],
    warnings: [],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Waste banks commonly accept clean aluminum cans. Steel cans are accepted less consistently.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility can take rinsed cans with other sorted recyclables.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy aluminum, steel, and iron when food and other trash are gone.",
    },
  },
  paper: {
    headline: "Keep paper dry and flatten boxes",
    steps: [
      "Remove food, tape, and plastic windows if they come off.",
      "Flatten boxes and keep the paper dry.",
      "Take clean paper and cardboard to a waste bank or a collector.",
    ],
    warnings: ["Greasy or wet paper is residual waste."],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Waste banks commonly buy clean cardboard and paper. Wet or food-stained paper is usually refused.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility may accept dry paper and cardboard with sorted recyclables.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy clean, dry cardboard and paper.",
    },
  },
  organic: {
    headline: "Keep food and garden waste out of recycling",
    steps: [
      "Remove every piece of packaging.",
      "Drain excess liquid.",
      "Use a school compost or a 3R facility organic process only if they accept this kind of waste.",
    ],
    warnings: ["Meat, dairy, and oily scraps are refused by many compost systems."],
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks do not buy food scraps or garden waste.",
      },
      {
        id: "tps3r",
        detail:
          "Many 3R facilities compost or process organic waste. Ask about meat, bones, and oil before you drop it off.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy food or garden waste.",
    },
  },
  textile: {
    headline: "Donate wearable clothes before discarding them",
    steps: [
      "If it is clean and still wearable, donate or repair it.",
      "Keep it dry. Moldy textiles are residual waste.",
      "Ask about a community or school collection. Most waste banks do not buy clothes.",
    ],
    warnings: ["Wet or moldy textiles usually cannot be reused."],
    places: [
      {
        id: "bank_sampah",
        detail: "Most waste banks do not buy clothing. A few community collections take clean textiles.",
      },
      {
        id: "tps3r",
        detail: "Ask the 3R facility. Textiles are often residual unless a separate collection exists.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy household clothing or shoes.",
    },
  },
  electronic: {
    headline: "Use a formal e-waste drop-off",
    steps: [
      "Do not put it in a household bin or a waste bank sack.",
      "Erase personal data, and remove batteries if you can do that without breaking the device.",
      "Take it to an e-waste or hazardous-waste collection. Coverage is uneven, so ask a local environment office or a retailer take-back.",
    ],
    warnings: ["Do not burn electronics to recover metal."],
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Formal e-waste and hazardous drop-offs are not in every city. A local environment office, a school drive, or a retailer take-back is the safer route when one exists.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Some collectors buy circuit boards and copper. Informal dismantling often burns plastic or uses acid, so selling it is not a safe disposal route.",
    },
  },
  hazardous: {
    headline: "Keep hazardous waste out of ordinary bins",
    steps: [
      "Do not put it in household waste, a waste bank, or a 3R facility pile.",
      "Keep it sealed and away from heat, children, and pets.",
      "Take it to a hazardous drop-off if you can find one, or ask the local environment office. Public drop-offs are still limited.",
    ],
    warnings: ["Do not puncture, crush, or burn hazardous waste."],
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Hazardous drop-off points exist in some cities, shops, and malls, and not at all in others. Ask the local environment office instead of guessing a bin.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Do not sell hazardous items to a scrap collector.",
    },
  },
  rubber: {
    headline: "Rubber usually needs a separate collection",
    steps: [
      "Keep it out of the recycling sack.",
      "Tires and large pieces need a workshop or a special collection.",
      "Small rubber items are usually residual waste.",
    ],
    warnings: ["Do not burn rubber."],
    places: [
      {
        id: "tps3r",
        detail: "Ask the 3R facility. Most treat small rubber items as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy household rubber. Some tire shops take old tires, which is not a guarantee.",
    },
  },
  wood: {
    headline: "Reuse untreated wood, or ask a 3R facility",
    steps: [
      "Reuse it if you can, and remove nails and screws.",
      "Untreated wood may be accepted for compost or reuse.",
      "Painted or treated wood is usually refused.",
    ],
    warnings: ["Painted or treated wood is not garden compost."],
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility may take untreated wood. Treated or painted wood is often refused.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy wood.",
    },
  },
  ceramic: {
    headline: "Ceramic is residual waste, not glass",
    steps: [
      "Wrap broken pieces so they cannot cut anyone.",
      "Put it in residual waste.",
      "Do not mix it with glass bottles.",
    ],
    warnings: ["Ceramic is not accepted as glass recycling."],
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility will usually treat ceramic as residual waste, not as recyclable glass.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy ceramic or pottery.",
    },
  },
  composite: {
    headline: "Mixed packaging is usually residual waste",
    steps: [
      "Separate parts that come apart, such as a plastic lid.",
      "Rinse food residue.",
      "Use residual waste unless a collection program explicitly wants that pack.",
    ],
    warnings: ["Do not hide composite packs in a paper or plastic sack."],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Most waste banks refuse sachets and other multilayer packs. Leave one only if that unit lists it.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats composite packaging as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy sachets, lined drink cartons, or other mixed packaging.",
    },
  },
  other: {
    headline: "Ask before you sort this",
    steps: [
      "Do not put an unknown item in a recycling sack.",
      "Ask your school, a waste bank, or a 3R facility.",
      "If nobody accepts it, use residual waste.",
    ],
    warnings: ["When the material is unclear, keep it out of recycling."],
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility can say whether the item is residual or needs a special drop-off.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Do not assume a scrap collector will buy an item you cannot name.",
    },
  },
};

const ITEM_OVERRIDES: Record<string, Partial<RuleBody>> = {
  "plastic-bottle": {
    headline: "Remove the cap and label",
    steps: [
      "Empty and rinse the bottle.",
      "Peel off the label. Remove the cap and bag caps separately if a waste bank wants them. Caps are usually a different plastic.",
      "Crush the bottle so it takes less space.",
      "Take clean bottles to a waste bank or a scrap collector who buys PET. A school PET bin is fine when the school collects bottles.",
    ],
    warnings: ["Oily or food-stained bottles are often rejected."],
    places: [
      {
        id: "bank_sampah",
        detail:
          "Waste banks commonly accept clean PET bottles and pay by weight. Prices and rules are set by that unit.",
      },
      {
        id: "tps3r",
        detail: "If there is no waste bank, ask the 3R facility to keep bottles separate from residual waste.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy clean, empty PET bottles. Bottles that still contain liquid are usually refused.",
    },
  },
  "plastic-bag": {
    headline: "Bundle clean bags; most buyers refuse them",
    steps: [
      "Empty and dry the bag.",
      "Bundle clean bags so they do not tangle bottles or paper.",
      "Use a drop-off only if it explicitly collects plastic bags.",
      "If no drop-off exists, put the bundle in residual waste.",
    ],
    warnings: ["Do not put loose bags in a sack of bottles or paper."],
    wasteStream: "special_dropoff",
    places: [
      {
        id: "bank_sampah",
        detail: "Most waste banks do not buy thin bags. A few collect them separately.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats thin bags as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy plastic bags.",
    },
  },
  "plastic-container": {
    headline: "Rinse the container and separate the lid",
    steps: [
      "Empty, rinse, and dry it.",
      "Remove the lid if it is a different plastic and bag lids separately.",
      "HDPE (#2) and PP (#5) are accepted more often than other codes.",
    ],
    warnings: ["Black plastic and food-stained tubs are often refused."],
    places: [
      {
        id: "bank_sampah",
        detail: "Some waste banks take clean tubs. Ask, because many only want bottles.",
      },
      {
        id: "tps3r",
        detail: "Ask the 3R facility if the waste bank will not take the container.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Some collectors buy hard plastic containers. Many only want PET bottles.",
    },
  },
  "plastic-film": {
    headline: "Keep film out of the bottle sack",
    steps: [
      "Wipe it and let it dry.",
      "Bundle film and wrappers together.",
      "Use a drop-off only if it lists soft plastic.",
      "Otherwise use residual waste.",
    ],
    warnings: ["Loose film contaminates paper and bottle collections."],
    wasteStream: "special_dropoff",
    places: [
      {
        id: "bank_sampah",
        detail: "Most waste banks refuse plastic film and wrappers.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats film as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy plastic film.",
    },
  },
  "plastic-cup": {
    headline: "Ask before treating a plastic cup as recycling",
    steps: [
      "Empty it, rinse grease, and separate the lid and straw.",
      "Thin cups are low value. A waste bank may refuse them even when it buys bottles.",
      "If nobody wants them, use residual waste.",
    ],
    warnings: ["Do not mix thin cups into a sack of PET bottles."],
    wasteStream: "unknown",
    places: [
      {
        id: "bank_sampah",
        detail: "Ask first. Many waste banks do not pay for thin plastic cups.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility will often treat refused cups as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy plastic cups.",
    },
  },
  "plastic-cutlery": {
    headline: "Plastic cutlery is residual waste",
    steps: [
      "Scrape off food.",
      "Keep forks, spoons, and straws out of a bottle sack.",
      "Put them in residual waste.",
    ],
    warnings: [],
    wasteStream: "landfill",
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility treats plastic cutlery as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy plastic cutlery.",
    },
  },
  styrofoam: {
    headline: "Styrofoam is residual waste",
    steps: [
      "Shake off food.",
      "Do not crumble it into a recycling sack.",
      "Put it in residual waste.",
    ],
    warnings: ["Styrofoam breaks into small pieces and is rarely recycled."],
    wasteStream: "landfill",
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks almost never accept styrofoam.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually sends styrofoam to residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy styrofoam.",
    },
  },
  "plastic-toy": {
    headline: "Donate a usable toy; broken toys are residual",
    steps: [
      "Donate it if it is intact and clean.",
      "Remove batteries first. Batteries are hazardous waste.",
      "A broken toy goes in residual waste.",
    ],
    warnings: ["Do not leave batteries inside a discarded toy."],
    wasteStream: "landfill",
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility treats broken plastic toys as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy household plastic toys.",
    },
  },
  "glass-scrap": {
    headline: "Wrap broken glass and keep it out of recycling",
    steps: [
      "Wrap the glass in thick paper or cardboard.",
      "Mark the bundle so nobody grabs it bare-handed.",
      "Use residual waste unless a 3R facility has a separate broken-glass collection.",
    ],
    warnings: ["Never put loose broken glass in a waste bank sack."],
    wasteStream: "special_dropoff",
    places: [
      {
        id: "tps3r",
        detail: "Ask the 3R facility. Many only accept broken glass as wrapped residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy broken glass.",
    },
  },
  "aluminum-can": {
    headline: "Rinse the can; aluminum is commonly bought",
    steps: [
      "Empty and rinse the can.",
      "You can crush it. Leave the tab on.",
      "Keep it separate from steel if you can.",
      "Take it to a waste bank or sell it to a scrap collector.",
    ],
    warnings: [],
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks commonly accept clean aluminum cans.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility can take rinsed cans with sorted recyclables.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy aluminum cans. This does not apply to aerosol cans.",
    },
  },
  "steel-can": {
    headline: "Rinse the steel can and cover sharp edges",
    steps: [
      "Empty and rinse it.",
      "Push the lid inside or cover the cut edge.",
      "Remove a loose paper label if it comes off easily.",
      "Sell it to a scrap collector, or ask a waste bank if they take steel.",
    ],
    warnings: [],
    places: [
      {
        id: "bank_sampah",
        detail: "Some waste banks take steel cans. Many pay only for aluminum.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility can add rinsed steel cans to sorted metal.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy steel and tin cans.",
    },
  },
  "metal-scrap": {
    headline: "Keep scrap metal free of trash and batteries",
    steps: [
      "Keep it dry and separate from food waste.",
      "Remove batteries, pressurized cans, and plastic if they come off.",
      "Sell clean iron, steel, or aluminum to a scrap collector.",
    ],
    warnings: ["Do not add aerosol cans or batteries to a scrap pile."],
    places: [
      {
        id: "bank_sampah",
        detail: "Some waste banks take clean cans. Larger scrap usually goes to a collector, not a waste bank.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors commonly buy iron, steel, and aluminum scrap.",
    },
  },
  "aerosol-can": {
    headline: "Treat aerosol cans as hazardous waste",
    steps: [
      "Do not puncture, crush, or burn the can.",
      "If it still sprays or contains product, keep it as hazardous waste.",
      "Ask a hazardous drop-off or the local environment office. Do not put it in a waste bank sack.",
    ],
    warnings: ["A pressurized can can explode if it is crushed or heated."],
    wasteStream: "hazardous",
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Aerosol cans are household hazardous waste. Drop-off coverage is uneven, so ask the local environment office rather than a regular bin.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Do not sell aerosol cans to a scrap collector, even if other metal is commonly bought.",
    },
  },
  "paper-cup": {
    headline: "Lined paper cups are residual waste",
    steps: [
      "Empty the cup and remove the lid and straw.",
      "Most cups have a plastic lining, so paper recycling will refuse them.",
      "Put the cup in residual waste unless a program explicitly accepts lined cups.",
    ],
    warnings: ["Do not flatten lined cups into a cardboard bundle."],
    wasteStream: "landfill",
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks usually refuse lined paper cups.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats lined cups as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy paper cups.",
    },
  },
  carton: {
    headline: "Check whether the carton is plain paper or lined",
    steps: [
      "Flatten it and keep it dry.",
      "Plain paperboard can go with cardboard.",
      "A drink carton with a plastic or foil lining is mixed packaging. Do not add it to a paper sack unless a buyer lists it.",
    ],
    warnings: ["Lined drink cartons are not the same as cardboard."],
    wasteStream: "unknown",
    places: [
      {
        id: "bank_sampah",
        detail:
          "Waste banks commonly buy plain paperboard. Many refuse lined drink cartons, so ask about the exact pack.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility can sort plain paperboard with paper and lined cartons with residual waste.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Scrap collectors commonly buy plain cardboard cartons. They rarely buy lined drink cartons.",
    },
  },
  tissue: {
    headline: "Used tissue is residual waste",
    steps: [
      "Do not put used tissue in a paper or cardboard sack.",
      "Compost it only if that system explicitly accepts tissue. Many do not.",
      "Otherwise use residual waste.",
    ],
    warnings: ["Clean office paper and used tissue are not the same material."],
    wasteStream: "landfill",
    places: [
      {
        id: "tps3r",
        detail: "Ask the 3R facility before composting tissue. If they refuse it, it is residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy tissue.",
    },
  },
  "food-scraps": {
    headline: "Compost food only where it is accepted",
    steps: [
      "Remove packaging, sauce packets, and plastic.",
      "Drain liquids.",
      "Use a school compost or a 3R facility organic bin if they accept this food.",
      "Meat, bones, and oily scraps are often refused. Ask before you add them.",
    ],
    warnings: ["Do not put food scraps in a waste bank sack."],
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks do not buy food scraps.",
      },
      {
        id: "tps3r",
        detail:
          "Many 3R facilities process organic waste. Acceptance of meat, bones, and oil varies by site.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy food scraps.",
    },
  },
  "garden-waste": {
    headline: "Take garden waste to compost, not to a waste bank",
    steps: [
      "Remove plastic ties, pots, and wire.",
      "Leaves and small trimmings can go to a school compost or a 3R facility if they take garden waste.",
      "Thick branches and treated wood are often refused.",
    ],
    warnings: ["Do not mix garden waste with food packaging."],
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility is the usual place for garden waste. Small sites may refuse woody branches.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors do not buy garden waste.",
    },
  },
  battery: {
    headline: "Tape loose terminals and use a hazardous drop-off",
    steps: [
      "Do not put batteries in a household bin, a waste bank, or a scrap pile.",
      "Tape the terminals of loose 9V and button cells so they cannot short. Do not puncture a swollen battery.",
      "Take them to a hazardous-waste or battery drop-off. Some electronics shops and malls collect batteries. Many areas have none, so ask the local environment office.",
    ],
    warnings: ["Damaged or swollen batteries can catch fire."],
    wasteStream: "hazardous",
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Battery drop-offs are real in some shops and cities and missing in others. This is not a nationwide network.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Do not sell batteries to a scrap collector.",
    },
  },
  "e-waste": {
    headline: "Erase data and use a formal e-waste drop-off",
    steps: [
      "Back up what you need, then erase personal data.",
      "Remove the battery if the device allows it without force.",
      "Use a retailer take-back, a school collection, or a local environment office drop-off when one exists.",
    ],
    warnings: ["Do not break the device open to pull out valuable parts."],
    wasteStream: "electronic",
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Formal e-waste collection is uneven across Indonesia. Ask before you travel to a drop-off that may not exist.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Collectors sometimes buy boards and copper. That trade often burns plastic, so it is not the recommended route.",
    },
  },
  "light-bulb": {
    headline: "Keep bulbs out of glass recycling",
    steps: [
      "Do not break the bulb. Fluorescent tubes and CFLs can contain mercury.",
      "Wrap it and keep it out of a glass sack or a waste bank sack.",
      "Take fluorescent bulbs to a hazardous drop-off if you can find one. LED and incandescent bulbs are still not glass recycling.",
    ],
    warnings: ["Do not vacuum a broken fluorescent bulb into household recycling."],
    wasteStream: "hazardous",
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Fluorescent bulbs are hazardous waste. A local drop-off may not exist, so ask the local environment office.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Do not sell light bulbs to a scrap collector.",
    },
  },
  cable: {
    headline: "Coil cables and prefer an e-waste drop-off",
    steps: [
      "Coil the cable and keep it out of household residual waste if a drop-off exists.",
      "Take it to an e-waste collection when you can.",
      "If you sell copper cable to a collector, do not burn the insulation off.",
    ],
    warnings: ["Burning cable insulation to recover copper is harmful."],
    wasteStream: "electronic",
    places: [
      {
        id: "b3_dropoff",
        detail: "An e-waste drop-off is the safer route. Availability depends on the city.",
      },
    ],
    scrap: {
      buys: "often",
      note: "Scrap collectors often buy copper cable. Sell it only if the insulation stays on. Do not burn it.",
    },
  },
  "medical-waste": {
    headline: "Use a medical or hazardous-waste route, not a household bin",
    steps: [
      "Keep it away from household waste and waste bank sacks.",
      "Put sharps in a rigid, closed container.",
      "Follow the school clinic, a community health clinic, or a hazardous medical drop-off. Do not invent a bin.",
    ],
    warnings: ["Do not handle needles you do not already manage safely."],
    wasteStream: "hazardous",
    places: [
      {
        id: "b3_dropoff",
        detail:
          "Medical waste needs a clinic, a community health clinic, or a hazardous-waste route. A 3R facility or a waste bank is not that route.",
      },
    ],
    scrap: {
      buys: "do_not_sell",
      note: "Do not sell medical waste to a scrap collector.",
    },
  },
  shoes: {
    headline: "Donate wearable shoes",
    steps: [
      "Donate the pair if it is dry and still wearable.",
      "Most waste banks do not buy shoes.",
      "Worn-out shoes are residual waste unless a collection drive asks for them.",
    ],
    warnings: ["Wet or moldy shoes cannot be donated."],
    places: [
      {
        id: "bank_sampah",
        detail: "Waste banks rarely accept shoes.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats worn-out shoes as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy shoes.",
    },
  },
  "textile-scrap": {
    headline: "Ask before offering fabric scraps",
    steps: [
      "Keep the fabric dry and free of oil or mold.",
      "Donate usable cloth. Soiled fabric is residual waste.",
      "A buyer has to want that fiber. Do not add it to a paper sack.",
    ],
    warnings: ["Oily rags can belong with hazardous waste, not textiles."],
    places: [
      {
        id: "bank_sampah",
        detail: "A few collections take clean cotton. Most waste banks do not buy fabric scraps.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Some collectors take clean cotton rags. Mixed or dirty fabric is usually refused.",
    },
  },
  "composite-packaging": {
    headline: "Multilayer packs are usually residual waste",
    steps: [
      "Rinse food residue and separate a loose lid.",
      "Do not mix sachets or lined cartons into paper or PET.",
      "Use residual waste unless a collection program names that pack.",
    ],
    warnings: ["A few collection programs exist. Coverage is local and limited."],
    wasteStream: "unknown",
    places: [
      {
        id: "bank_sampah",
        detail: "Most waste banks refuse multilayer sachets. Accept one only if it is on their list.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility usually treats composite packaging as residual waste.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy sachets or other mixed packaging.",
    },
  },
};

const MATERIAL_STREAM: Record<MaterialGroup, WasteStream> = {
  plastic: "recycling",
  glass: "recycling",
  metal: "recycling",
  paper: "recycling",
  organic: "organic",
  textile: "textile",
  electronic: "electronic",
  hazardous: "hazardous",
  rubber: "special_dropoff",
  wood: "special_dropoff",
  ceramic: "landfill",
  composite: "unknown",
  other: "unknown",
};

const STREAM_RULES: Record<WasteStream, RuleBody> = {
  recycling: {
    headline: "Sort it clean before a waste bank will look at it",
    steps: [
      "Empty and rinse it.",
      "Keep it dry and separate from other materials.",
      "Ask a waste bank or a 3R facility before you treat it as recycling.",
    ],
    warnings: ["If they refuse it, use residual waste instead of leaving it there."],
    places: [
      {
        id: "bank_sampah",
        detail: "A waste bank buys only the materials on its own list.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility may accept sorted recyclables the waste bank does not buy.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "Scrap collectors buy some clean recyclables, especially metal, cardboard, and PET. Ask about this item.",
    },
  },
  organic: GROUP_RULES.organic,
  hazardous: GROUP_RULES.hazardous,
  electronic: GROUP_RULES.electronic,
  textile: GROUP_RULES.textile,
  landfill: {
    headline: "Treat this as residual waste",
    steps: [
      "Empty leftover food or liquid.",
      "Keep it out of the waste bank sack.",
      "Put it with residual waste.",
    ],
    warnings: [],
    places: [
      {
        id: "tps3r",
        detail: "A 3R facility usually sends this kind of item to residual waste rather than recycling it.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy residual waste.",
    },
  },
  special_dropoff: {
    headline: "This needs a separate collection",
    steps: [
      "Keep it out of ordinary bins and waste bank sacks.",
      "Ask the school or a 3R facility whether a separate drop-off exists.",
      "If none exists, ask before using residual waste. Some items still do not belong there.",
    ],
    warnings: [],
    places: [
      {
        id: "tps3r",
        detail: "Ask the 3R facility. Not every area has a special collection.",
      },
    ],
    scrap: {
      buys: "rarely",
      note: "Scrap collectors rarely buy items that need a special drop-off.",
    },
  },
  unknown: {
    headline: "Check before you treat this as recycling",
    steps: [
      "Do not mix it into a sack of bottles, paper, or cans.",
      "Ask a waste bank or a 3R facility about this exact item.",
      "If nobody accepts it, use residual waste.",
    ],
    warnings: ["When in doubt, keep it out of recycling."],
    places: [
      {
        id: "bank_sampah",
        detail: "Ask the waste bank. If it is not on their list, do not leave it there.",
      },
      {
        id: "tps3r",
        detail: "A 3R facility can usually say whether it is residual waste.",
      },
    ],
    scrap: {
      buys: "sometimes",
      note: "A collector might buy it only if they recognize the material. If they refuse, do not add it to other recyclables.",
    },
  },
};

function streamForMaterial(materialGroup: MaterialGroup): WasteStream {
  return MATERIAL_STREAM[materialGroup] ?? "unknown";
}

function warningsForItem(canonicalItem: string, warnings: string[]): string[] {
  return warnings.filter(
    (warning) => canonicalItem === "aerosol-can" || !/aerosol/i.test(warning),
  );
}

function toOptions(places: PlaceDraft[] | undefined): LocalOption[] {
  return (places ?? []).map((place) => ({
    id: place.id,
    title: PLACE_TITLES[place.id],
    detail: place.detail,
  }));
}

export function parseDisposalContext(value: FormDataEntryValue | null): DisposalContext | null {
  if (value === "school" || value === "neighborhood") return value;
  return null;
}

export function getDisposalGuidance(
  canonicalItem: string,
  materialGroup: MaterialGroup,
  context?: DisposalContext | null,
): DisposalGuidance {
  const item = getCanonicalItem(canonicalItem);
  const groupRule = GROUP_RULES[materialGroup] ?? GROUP_RULES.other;
  const override = ITEM_OVERRIDES[canonicalItem];
  const wasteStream =
    override?.wasteStream ?? item?.defaultWasteStream ?? streamForMaterial(materialGroup);

  const materialAgrees = streamForMaterial(materialGroup) === wasteStream;
  const aligned = materialAgrees ? groupRule : STREAM_RULES[wasteStream];
  const selected = context ?? null;

  return {
    wasteStream,
    headline: override?.headline ?? aligned.headline,
    steps: override?.steps ?? aligned.steps,
    warnings: warningsForItem(canonicalItem, override?.warnings ?? aligned.warnings),
    localOptions: toOptions(override?.places ?? aligned.places),
    scrap: override?.scrap ?? aligned.scrap ?? DEFAULT_SCRAP,
    scope: "general",
    context: selected,
    contextNote: selected ? CONTEXT_NOTES[selected] : null,
    sourceNote: SOURCE_NOTE,
  };
}
