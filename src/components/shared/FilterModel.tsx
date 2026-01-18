import { AnimatePresence,motion } from 'framer-motion';
import { FiX } from "react-icons/fi";

type DietFilter = "veg" | "nonveg" | "all";

interface FilterModalProps {
  showFilterModal: boolean;
  setShowFilterModal: React.Dispatch<React.SetStateAction<boolean>>;

  dietFilter: DietFilter;
  setDietFilter: React.Dispatch<React.SetStateAction<DietFilter>>;

  showAvailableOnly: boolean;
  setShowAvailableOnly: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterModel = ({
  showFilterModal,
  setShowFilterModal,
  dietFilter,
  setDietFilter,
  showAvailableOnly,
  setShowAvailableOnly,
}: FilterModalProps) => {
  return (
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Diet Preference Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Diet Preference
                  </h3>
                  <div className="flex gap-3">
                    {/* Veg Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("veg")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "veg"
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "veg" ? "animate-bounce" : ""
                          }`}
                        >
                          🌿
                        </div>
                        <span className="text-sm font-semibold">Veg</span>
                      </div>
                      {dietFilter === "veg" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Both Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("all")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "all"
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "all" ? "animate-bounce" : ""
                          }`}
                        >
                          🍽️
                        </div>
                        <span className="text-sm font-semibold">Both</span>
                      </div>
                      {dietFilter === "all" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Non-Veg Chip */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDietFilter("nonveg")}
                      className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                        dietFilter === "nonveg"
                          ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
                          : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-3xl ${
                            dietFilter === "nonveg" ? "animate-bounce" : ""
                          }`}
                        >
                          🍗
                        </div>
                        <span className="text-sm font-semibold">Non-Veg</span>
                      </div>
                      {dietFilter === "nonveg" && (
                        <motion.div
                          layoutId="dietSelector"
                          className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Availability Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Availability
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                    className={`w-full relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                      showAvailableOnly
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white/60 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">✨</div>
                        <span className="font-semibold">
                          Show Available Only
                        </span>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                          showAvailableOnly
                            ? "bg-white/30"
                            : "bg-gray-300/50"
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: showAvailableOnly ? 24 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full ${
                            showAvailableOnly
                              ? "bg-white"
                              : "bg-white"
                          } shadow-md`}
                        />
                      </div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDietFilter("all");
                      setShowAvailableOnly(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-white/80 backdrop-blur-md border border-gray-200/50 hover:bg-white transition-all"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  )
}

export default FilterModel
