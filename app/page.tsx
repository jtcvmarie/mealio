'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

const COMMON_INGREDIENTS = [
  'Chicken', 'Garlic', 'Onion', 'Tomato', 'Olive Oil', 
  'Rice', 'Pasta', 'Eggs', 'Cheese', 'Butter', 
  'Beef', 'Lemon', 'Cilantro', 'Potatoes', 'Soy Sauce',
  'Flour', 'Sugar', 'Salt', 'Black Pepper', 'Milk',
  'Chicken Broth', 'Mushrooms', 'Bell Pepper', 'Carrot',
  'Celery', 'Bacon', 'Bread', 'Yogurt', 'Cream', 'Ginger',
  'Spinach', 'Avocado', 'Black Beans', 'Cheddar', 'Thyme'
];

export default function Home() {
  const [selected, setSelected] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // In-memory cache to store fetched results per ingredient combination and protect API quota
  const cacheRef = useRef<Record<string, any[]>>({});
  
  const [openUsed, setOpenUsed] = useState<Record<number, boolean>>({});
  const [openMissed, setOpenMissed] = useState<Record<number, boolean>>({});
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});
  const [attachIngredients, setAttachIngredients] = useState<Record<number, boolean>>({});

  const toggleIngredient = (ing: string) => {
    const item = ing.toLowerCase().trim();
    if (!item) return;
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const item = customInput.toLowerCase().trim();
    if (!selected.includes(item)) {
      setSelected([...selected, item]);
    }
    setCustomInput('');
  };

  const matchingAutocomplete = useMemo(() => {
    if (!customInput.trim()) return [];
    const query = customInput.toLowerCase();
    return COMMON_INGREDIENTS.filter(
      (ing) => ing.toLowerCase().includes(query) && !selected.includes(ing.toLowerCase())
    ).slice(0, 5);
  }, [customInput, selected]);

  useEffect(() => {
    if (selected.length === 0) {
      setRecipes([]);
      setSuggestions([]);
      setApiError(null);
      return;
    }

    const cacheKey = [...selected].sort().join(',');

    // Check cache first before making any network request
    if (cacheRef.current[cacheKey]) {
      setRecipes(cacheRef.current[cacheKey]);
      setLoading(false);
      setApiError(null);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`/api/recipes?ingredients=${selected.join(',')}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Save result to cache
          cacheRef.current[cacheKey] = data;
          setRecipes(data);

          const counts: Record<string, number> = {};
          data.forEach((recipe: any) => {
            recipe.missedIngredients?.forEach((m: any) => {
              const name = m.name.toLowerCase();
              if (!selected.includes(name)) {
                counts[name] = (counts[name] || 0) + 1;
              }
            });
          });

          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

          setSuggestions(sorted.slice(0, 15));
        } else {
          setRecipes([]);
          setApiError(data.error || 'Failed to load recipes.');
        }
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setApiError('Network error connecting to recipe service.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecipes, 300);
    return () => clearTimeout(timer);
  }, [selected]);

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      if (a.missedIngredientCount !== b.missedIngredientCount) {
        return a.missedIngredientCount - b.missedIngredientCount;
      }
      return b.usedIngredientCount - a.usedIngredientCount;
    });
  }, [recipes]);

  const toggleAccordion = (id: number, type: 'used' | 'missed' | 'steps') => {
    if (type === 'used') {
      setOpenUsed(prev => ({ ...prev, [id]: !prev[id] }));
    } else if (type === 'missed') {
      setOpenMissed(prev => ({ ...prev, [id]: !prev[id] }));
    } else {
      setOpenSteps(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const toggleAttach = (id: number) => {
    setAttachIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-[#f0eae1] to-[#e6dccf] animate-ambient text-stone-700 p-4 md:p-8 max-w-3xl mx-auto flex flex-col items-center">
      
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-light tracking-wide text-stone-800 mb-1">Podge</h1>
        <p className="text-stone-500 text-xs font-light tracking-wide">Turn what you have into something wonderful</p>
      </header>

      {/* Custom Input */}
      <section className="w-full mb-6 relative flex justify-center">
        <form onSubmit={handleAddCustom} className="flex gap-2 w-full max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add pantry item..."
              className="w-full bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400/80 shadow-sm transition text-center"
            />
            {matchingAutocomplete.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-stone-200 rounded-xl overflow-hidden shadow-xl text-center">
                {matchingAutocomplete.map((item) => (
                  <li
                    key={item}
                    onClick={() => {
                      toggleIngredient(item);
                      setCustomInput('');
                    }}
                    className="px-4 py-2 text-xs text-stone-700 hover:bg-amber-50/60 cursor-pointer capitalize transition"
                  >
                    + {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            className="squishy-btn bg-[#d8e2dc] text-[#3a5a40] font-medium px-5 py-2.5 rounded-xl text-xs border border-[#c2d0c8]"
          >
            Add
          </button>
        </form>
      </section>

      {/* Selected Ingredients Pill Box */}
      <section className="w-full mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-sm flex flex-col items-center text-center">
        <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-3">Selected Pantry</h2>
        {selected.length === 0 ? (
          <p className="text-stone-400 text-xs font-light italic">Your kitchen is empty. Add items above or pick below...</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {selected.map((ing) => (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className="squishy-btn bg-[#e07a5f]/15 text-[#b84a32] border border-[#e07a5f]/30 font-medium px-3.5 py-1.5 rounded-full text-[11px] flex items-center gap-1.5"
              >
                <span className="capitalize">{ing}</span>
                <span className="font-bold opacity-60">✕</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Starting Ingredients / Suggestions */}
      <section className="w-full mb-8 flex flex-col items-center">
        <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-3">
          {selected.length === 0 ? 'Pantry Staples' : 'Suggested Additions'}
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {(selected.length === 0 ? COMMON_INGREDIENTS.slice(0, 15) : suggestions).map((ing) => {
            const isSelected = selected.includes(ing.toLowerCase());
            return (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className={`squishy-btn px-3 py-1.5 rounded-xl text-[11px] font-medium border transition capitalize ${
                  isSelected
                    ? 'bg-[#81b29a]/20 border-[#81b29a] text-[#2f4f3e]'
                    : 'bg-white/70 border-stone-200/80 text-stone-600 hover:bg-white'
                }`}
              >
                + {ing}
              </button>
            );
          })}
        </div>
      </section>

      {/* Recipes Section */}
      <section className="w-full flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <h2 className="text-sm font-medium text-stone-800 tracking-wide">Matching Recipes ({sortedRecipes.length})</h2>
          {loading && <span className="text-[11px] text-amber-700/80 animate-pulse font-light">Simmering ideas...</span>}
        </div>

        {apiError && (
          <div className="w-full bg-red-50/80 border border-red-200 text-red-600 text-xs p-4 rounded-2xl mb-4 text-center">
            ⚠️ {apiError}
          </div>
        )}

        {sortedRecipes.length === 0 && !loading && !apiError && selected.length > 0 && (
          <p className="text-stone-400 text-xs font-light italic text-center py-6">No recipes found for this exact combination yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {sortedRecipes.map((recipe) => {
            const recipeUrl = recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${recipe.id}`;
            const isAttachOn = !!attachIngredients[recipe.id];
            const googleSearchQuery = isAttachOn && selected.length > 0
              ? `${recipe.title} ${selected.join(' ')} recipe`
              : `${recipe.title} recipe`;
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`;

            const isUsedOpen = openUsed[recipe.id];
            const isMissedOpen = openMissed[recipe.id];
            const isStepsOpen = openSteps[recipe.id];

            return (
              <div
                key={recipe.id}
                className="bg-white/70 backdrop-blur-md border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col text-center"
              >
                <div className="relative h-36 overflow-hidden bg-stone-100">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-500" />
                  {recipe.readyInMinutes && (
                    <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-medium text-stone-700 shadow-sm">
                      ⏱ {recipe.readyInMinutes}m
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 items-center">
                  <div className="w-full">
                    <a
                      href={recipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-stone-800 hover:text-amber-800 transition line-clamp-1 block mb-2 text-sm"
                    >
                      {recipe.title} ↗
                    </a>

                    {/* Recipe Statistics Block */}
                    <div className="flex flex-wrap justify-center items-center gap-2 mb-3 text-[11px] text-stone-500 font-light">
                      {recipe.servings && <span>🍽️ {recipe.servings} sv</span>}
                      {recipe.healthScore !== undefined && recipe.healthScore !== null && (
                        <span>❤️ Health {recipe.healthScore}%</span>
                      )}
                      {recipe.spoonacularScore !== undefined && recipe.spoonacularScore !== null && (
                        <span>⭐ Score {Math.round(recipe.spoonacularScore)}%</span>
                      )}
                      {recipe.pricePerServing !== undefined && recipe.pricePerServing !== null && (
                        <span>💰 ${(recipe.pricePerServing / 100).toFixed(2)}/sv</span>
                      )}
                      {recipe.diets && recipe.diets.length > 0 && (
                        <span className="capitalize">🌱 {recipe.diets[0]}</span>
                      )}
                    </div>

                    {/* Search Recipe & Checkbox Row */}
                    <div className="flex items-center justify-center gap-3 mb-3 text-xs text-stone-600 bg-stone-100/60 py-2 px-3 rounded-xl border border-stone-200/50">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAttachOn}
                          onChange={() => toggleAttach(recipe.id)}
                          className="rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 w-3 h-3"
                        />
                        <span className="font-light text-[11px] text-stone-500">Attach Ingredients</span>
                      </label>
                      <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="squishy-btn px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-medium tracking-wide transition inline-flex items-center gap-1 border border-stone-300/60 text-[11px]"
                      >
                        🔎 Search Recipe
                      </a>
                    </div>
                    
                    <div className="text-xs text-stone-500 space-y-2.5 border-t border-stone-200/60 pt-3 w-full">
                      
                      {/* Used Ingredients Accordion */}
                      <div className="w-full">
                        <button
                          onClick={() => toggleAccordion(recipe.id, 'used')}
                          className="text-[#3a5a40] font-medium flex items-center justify-between w-full px-2 py-1 rounded-lg hover:bg-[#81b29a]/10 transition text-xs"
                        >
                          <span>✓ Uses {recipe.usedIngredientCount} selected</span>
                          <span className="text-stone-400">{isUsedOpen ? '▾' : '▸'}</span>
                        </button>
                        {isUsedOpen && recipe.usedIngredients && (
                          <ul className="mt-1.5 space-y-1 text-stone-600 text-left pl-3 border-l-2 border-[#81b29a]/40 text-xs">
                            {recipe.usedIngredients.map((item: any, idx: number) => (
                              <li key={idx} className="font-light">• {item.original}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Missed Ingredients Accordion */}
                      {recipe.missedIngredientCount > 0 && (
                        <div className="w-full">
                          <button
                            onClick={() => toggleAccordion(recipe.id, 'missed')}
                            className="text-stone-500 font-medium flex items-center justify-between w-full px-2 py-1 rounded-lg hover:bg-stone-200/40 transition text-xs"
                          >
                            <span>+ Needs {recipe.missedIngredientCount} more item{recipe.missedIngredientCount !== 1 ? 's' : ''}</span>
                            <span className="text-stone-400">{isMissedOpen ? '▾' : '▸'}</span>
                          </button>
                          {isMissedOpen && recipe.missedIngredients && (
                            <ul className="mt-1.5 space-y-1 text-stone-500 text-left pl-3 border-l-2 border-stone-300 text-xs">
                              {recipe.missedIngredients.map((item: any, idx: number) => (
                                <li key={idx} className="font-light">• {item.original}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Step-by-Step Directions Accordion */}
                      <div className="w-full">
                        <button
                          onClick={() => toggleAccordion(recipe.id, 'steps')}
                          className="text-amber-800 font-medium flex items-center justify-between w-full px-2 py-1 rounded-lg hover:bg-amber-100/50 transition text-xs"
                        >
                          <span>📖 View Directions</span>
                          <span className="text-stone-400">{isStepsOpen ? '▾' : '▸'}</span>
                        </button>
                        {isStepsOpen && (
                          <div className="mt-1.5 space-y-1.5 text-stone-600 text-left pl-3 border-l-2 border-amber-300 text-xs">
                            {recipe.analyzedInstructions?.[0]?.steps ? (
                              recipe.analyzedInstructions[0].steps.map((step: any) => (
                                <div key={step.number} className="text-[11px] font-light">
                                  <span className="font-semibold text-stone-700">{step.number}.</span> {step.step}
                                </div>
                              ))
                            ) : recipe.instructions ? (
                              <div className="text-[11px] font-light prose prose-stone" dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                            ) : (
                              <p className="text-[11px] italic text-stone-400">
                                Detailed instructions available on{' '}
                                <a
                                  href={recipeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-amber-800 transition"
                                >
                                  source website
                                </a>.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
