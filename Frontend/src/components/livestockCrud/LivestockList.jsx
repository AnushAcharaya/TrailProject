// src/components/livestockCrud/LivestockList.jsx
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaPaw, FaArrowLeft } from "react-icons/fa";
import LivestockCard from "./LivestockCard";
import { tAnimal } from "../../utils/translateEnum";
import { useLocalizedNumber } from "../../utils/formatNumber";

/**
 * Group an array of livestock by species_name.
 * Each entry: { key, species_name, items: [...] }
 */
const groupBySpecies = (livestockData) => {
  const groups = new Map();
  for (const animal of livestockData) {
    const species = (animal.species_name || "Unspecified").trim();
    if (!groups.has(species)) {
      groups.set(species, {
        key: species,
        species_name: species,
        items: [],
      });
    }
    groups.get(species).items.push(animal);
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.species_name.localeCompare(b.species_name)
  );
};

const LivestockList = ({ livestockData, onDelete }) => {
  const { t: tCommon } = useTranslation("common");
  const fmt = useLocalizedNumber();
  const [activeSpeciesKey, setActiveSpeciesKey] = useState(null);

  const speciesGroups = useMemo(
    () => groupBySpecies(livestockData),
    [livestockData]
  );
  const activeGroup =
    speciesGroups.find((g) => g.key === activeSpeciesKey) || null;

  // ────────────────────────────────────────────────────────────
  // Detail view: animals inside the chosen species
  // ────────────────────────────────────────────────────────────
  if (activeGroup) {
    return (
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Back / breadcrumb header */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <button
            onClick={() => setActiveSpeciesKey(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
          >
            <FaArrowLeft />
            Back to all species
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-lg p-2">
              <FaPaw className="text-emerald-600" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {tAnimal(tCommon, activeGroup.species_name)}
              </h3>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-emerald-700">
                  {fmt(activeGroup.items.length)}{" "}
                  {activeGroup.items.length === 1 ? "animal" : "animals"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Animals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGroup.items.map((item) => (
            <LivestockCard key={item.id} livestock={item} onDelete={onDelete} />
          ))}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // Default view: grid of species cards
  // ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {speciesGroups.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => setActiveSpeciesKey(group.key)}
            className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 p-7 text-left flex flex-col gap-5 min-h-[320px]"
          >
            {/* Top row: paw icon + count badge */}
            <div className="flex items-start justify-between">
              <div className="bg-emerald-50 group-hover:bg-emerald-100 rounded-xl p-5 transition-colors">
                <FaPaw className="text-emerald-600" size={36} />
              </div>
              <span className="bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                {fmt(group.items.length)}{" "}
                {group.items.length === 1 ? "animal" : "animals"}
              </span>
            </div>

            {/* Middle: species name + big count */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-1.5">
                {tAnimal(tCommon, group.species_name)}
              </h3>
              <p className="text-base text-gray-500">
                <span className="text-3xl font-extrabold text-emerald-600">
                  {fmt(group.items.length)}
                </span>{" "}
                {group.items.length === 1 ? "animal" : "animals"} in total
              </p>
            </div>

            {/* Bottom: hint */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                View animals
              </span>
              <span className="text-emerald-600 group-hover:translate-x-1 transition-transform text-lg">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LivestockList;
