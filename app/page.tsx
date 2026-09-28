'use client';

import { useState, useEffect, useMemo } from 'react';

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
  
  // Track open/closed state for recipe accordions
  const [openUsed, setOpenUsed] = useState<Record<number, boolean>>({});
  const [openMissed, setOpenMissed] = useState<Record<number, boolean>>({});

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

  // Predictive text suggestions based on user input
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
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes?ingredients=${selected.join(',')}`);
        const data = await res.json();

        if (Array.isArray(data)) {
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
        }
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRecipes, 300);
    return () => clearTimeout(timer);
  }, [selected]);

  // Sort recipes by least missed ingredients first
  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      if (a.missedIngredientCount !== b.missedIngredientCount) {
        return a.missedIngredientCount - b.missedIngredientCount;
      }
      return b.usedIngredientCount - a.usedIngredientCount;
    });
  }, [recipes]);

  const toggleAccordion = (id: number, type: 'used' | 'missed') => {
    if (type === 'used') {
      setOpenUsed(prev => ({ ...prev, [id]: !prev[id] }));
    } else {
      setOpenMissed(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">Podge</h1>
        <p className="text-slate-400 text-sm mt-1">Select ingredients to discover flavor combinations & recipes</p>
      </header>

      {/* Custom Ingredient Input Form */}
      <section className="mb-6 relative">
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type any custom ingredient..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {matchingAutocomplete.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                {matchingAutocomplete.map((item) => (
                  <li
                    key={item}
                    onClick={() => {
                      toggleIngredient(item);
                      setCustomInput('');
                    }}
                    className="px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer capitalize"
                  >
                    + {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
          >
            Add
          </button>
        </form>
      </section>

      <section className="mb-6 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Selected Ingredients</h2>
        {selected.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Type an ingredient above or tap suggestions below...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((ing) => (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className="bg-emerald-500 text-slate-950 font-medium px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-emerald-400 transition"
              >
                <span className="capitalize">{ing}</span>
                <span className="font-bold ml-1">✕</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
          {selected.length === 0 ? 'Common Starting Ingredients' : 'Suggested Additions'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(selected.length === 0 ? COMMON_INGREDIENTS.slice(0, 15) : suggestions).map((ing) => {
            const isSelected = selected.includes(ing.toLowerCase());
            return (
              <button
                key={ing}
                onClick={() => toggleIngredient(ing)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition capitalize ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
              >
                + {ing}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-200">Matching Recipes</h2>
          {loading && <span className="text-xs text-emerald-400 animate-pulse">Updating...</span>}
        </div>
        {sortedRecipes.length === 0 && !loading && selected.length > 0 && (
          <p className="text-slate-500 text-sm">No recipes found for this exact combination.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedRecipes.map((recipe) => {
            const recipeUrl = `https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${recipe.id}`;
            const isUsedOpen = openUsed[recipe.id];
            const isMissedOpen = openMissed[recipe.id];

            return (
              <div
                key={recipe.id}
                className="bg-slate-800 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg flex flex-col"
              >
                <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <a
                      href={recipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-100 hover:text-emerald-400 transition line-clamp-1 block mb-2"
                    >
                      {recipe.title} ↗
                    </a>
                    
                    <div className="text-xs text-slate-400 mb-3 space-y-2 border-t border-slate-700/60 pt-2">
                      {/* Used Ingredients Dropdown */}
                      <div>
                        <button
                          onClick={() => toggleAccordion(recipe.id, 'used')}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-between w-full text-left"
                        >
                          <span>✓ Uses {recipe.usedIngredientCount} selected ingredient{recipe.usedIngredientCount !== 1 ? 's' : ''}</span>
                          <span>{isUsedOpen ? '▾' : '▸'}</span>
                        </button>
                        {isUsedOpen && recipe.usedIngredients && (
                          <ul className="mt-1 pl-3 space-y-1 text-slate-300 border-l border-emerald-500/30">
                            {recipe.usedIngredients.map((item: any, idx: number) => (
                              <li key={idx}>• {item.original}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Missed Ingredients Dropdown */}
                      {recipe.missedIngredientCount > 0 && (
                        <div>
                          <button
                            onClick={() => toggleAccordion(recipe.id, 'missed')}
                            className="text-slate-400 hover:text-slate-300 font-medium flex items-center justify-between w-full text-left"
                          >
                            <span>+ Requires {recipe.missedIngredientCount} additional item{recipe.missedIngredientCount !== 1 ? 's' : ''}</span>
                            <span>{isMissedOpen ? '▾' : '▸'}</span>
                          </button>
                          {isMissedOpen && recipe.missedIngredients && (
                            <ul className="mt-1 pl-3 space-y-1 text-slate-400 border-l border-slate-600">
                              {recipe.missedIngredients.map((item: any, idx: number) => (
                                <li key={idx}>• {item.original}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
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
