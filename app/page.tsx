'use client';

import { useState, useMemo } from 'react';

// Hardcoded Meal Data
const MENU_DATA = [
  {
    "id": 1,
    "name": "Heart & Seoul Steak Bowl",
    "ingredients": [
      "Steak Tenderloin", "Rainbow Slaw", "Cucumbers", "Green Onion / Chopped Green Onion", 
      "Edamame / Shelled Edamame", "Charred Broccoli", "U.S.-Grown 5-Grain Wild Rice Blend", 
      "Sesame Ginger Dressing", "Gochujang Drizzle", "Wontons", "Tuxedo Sesame Seed Shake"
    ]
  },
  {
    "id": 2,
    "name": "MADiterranean Bowl",
    "ingredients": [
      "Herb-Grilled Chicken", "Rainbow Slaw", "Grape Tomatoes", "Cucumbers", "Pickled Red Onion", 
      "Crumbled Feta Cheese", "Creamy Whipped Feta", "U.S.-Grown 5-Grain Wild Rice Blend", 
      "House-Made Green Goddess Dressing", "Green Herb Drizzle", "Stacy's Pita Chips", "Chopped Mint"
    ]
  },
  {
    "id": 3,
    "name": "Elote Mac Bowl",
    "ingredients": [
      "Roasted Southwest Chicken", "Fire-Roasted Corn / Roasted Corn", "Green Onion / Chopped Green Onion", 
      "Creamy Cotija Cheese", "White Cheddar Cavatappi Mac", "Cilantro Chili Lime Dressing", "Fresh Chopped Cilantro"
    ]
  },
  {
    "id": 4,
    "name": "Southwest Bowl",
    "ingredients": [
      "Roasted Southwest Chicken", "Spinach", "Fire-Roasted Corn / Roasted Corn", "Grape Tomatoes", 
      "Fresh Avocado", "Creamy Cotija Cheese", "U.S.-Grown 5-Grain Wild Rice Blend", "Cilantro Chili Lime Dressing"
    ]
  },
  {
    "id": 5,
    "name": "Wild Harvest Bowl",
    "ingredients": [
      "Herb-Grilled Chicken", "Spinach", "Shredded Kale", "Charred Red Onion", "Roasted Sweet Potato", 
      "Fuji Apple", "Goat Cheese / Crumbled Goat Cheese", "U.S.-Grown 5-Grain Wild Rice Blend", 
      "House-Made Honey Balsamic Vinaigrette", "Craisins / Dried Cranberries"
    ]
  },
  {
    "id": 6,
    "name": "Smokin' Steak Caesar Wrap",
    "ingredients": [
      "Steak Tenderloin", "Hand-Chopped Romaine", "Shaved Parmesan Cheese", "Whole Wheat Tortilla", 
      "House-Made Chipotle Caesar Dressing", "Hot Chili Aioli Drizzle", "Focaccia Crouton Crumble / House-Made Focaccia Croutons", 
      "Parmesan Crisps", "MAD Spice"
    ]
  },
  {
    "id": 7,
    "name": "Steak Fajita Wrap",
    "ingredients": [
      "Steak Tenderloin", "Fire-Roasted Corn / Roasted Corn", "Roasted / Fire-Roasted Red Peppers", 
      "Charred Red Onion", "Green Chiles", "Shredded White Cheddar / White Cheddar", 
      "U.S.-Grown 5-Grain Wild Rice Blend", "Whole Wheat Tortilla", "Cilantro Chili Lime Dressing", "Black Beans"
    ]
  },
  {
    "id": 8,
    "name": "Southwest Wrap",
    "ingredients": [
      "Roasted Southwest Chicken", "Spinach", "Fire-Roasted Corn / Roasted Corn", "Grape Tomatoes", 
      "Fresh Avocado", "Creamy Cotija Cheese", "U.S.-Grown 5-Grain Wild Rice Blend", "Spinach Tortilla", 
      "Cilantro Chili Lime Dressing"
    ]
  },
  {
    "id": 9,
    "name": "Spicy Street Corn Wrap",
    "ingredients": [
      "Roasted Southwest Chicken", "Hand-Chopped Romaine", "Shredded Red Cabbage", "Fire-Roasted Corn / Roasted Corn", 
      "Pickled Red Onion", "Fresh Avocado", "Creamy Cotija Cheese", "Whole Wheat Tortilla", 
      "Cilantro Chili Lime Dressing", "Fritos", "Fresh Chopped Cilantro"
    ]
  },
  {
    "id": 10,
    "name": "Cowboy Cookout Steak Salad",
    "ingredients": [
      "Steak Tenderloin", "Hand-Chopped Romaine", "Mixed Greens", "Fire-Roasted Corn / Roasted Corn", 
      "Roasted / Fire-Roasted Red Peppers", "Fresh Avocado", "Creamy Cotija Cheese", 
      "House-Made Smoky Chipotle Ranch Dressing", "BBQ Drizzle", "Black Beans", "Crispy Onions"
    ]
  },
  {
    "id": 11,
    "name": "Smokin' Steak Caesar Salad",
    "ingredients": [
      "Steak Tenderloin", "Hand-Chopped Romaine", "Shaved Parmesan Cheese", "House-Made Chipotle Caesar Dressing", 
      "Hot Chili Aioli Drizzle", "Focaccia Crouton Crumble / House-Made Focaccia Croutons", "Parmesan Crisps", "MAD Spice"
    ]
  },
  {
    "id": 12,
    "name": "Mangocado Salad",
    "ingredients": [
      "Roasted Southwest Chicken", "Mixed Greens", "Fire-Roasted Corn / Roasted Corn", "Fresh Avocado", 
      "Juicy Mango Chunks", "Shredded White Cheddar / White Cheddar", "House-Made Creamy Ginger Dressing"
    ]
  },
  {
    "id": 13,
    "name": "Orchard Salad",
    "ingredients": [
      "Herb-Grilled Chicken", "Hand-Chopped Romaine", "Spinach", "Shredded Kale", "Fuji Apple", 
      "Goat Cheese / Crumbled Goat Cheese", "House-Made Honey Balsamic Vinaigrette", 
      "Focaccia Crouton Crumble / House-Made Focaccia Croutons", "Craisins / Dried Cranberries", "Candied Pecans"
    ]
  },
  {
    "id": 14,
    "name": "Creamy Whipped Feta Dip",
    "ingredients": [
      "Carrot Sticks", "Celery Sticks", "Creamy Whipped Feta", "Honey", "Herb Focaccia Bread", "MAD Spice"
    ]
  },
  {
    "id": 15,
    "name": "Loaded Mediterranean Hummus",
    "ingredients": [
      "Carrot Sticks", "Celery Sticks", "Olive Oil", "Chickpeas", "Classic Roasted Garlic Hummus", 
      "Herb Focaccia Bread", "Fresh Chopped Parsley"
    ]
  },
  {
    "id": 16,
    "name": "Green Goddess Pasta Salad",
    "ingredients": [
      "Roasted / Fire-Roasted Red Peppers", "Cucumbers", "Thinly Sliced Red Onions", "Crumbled Feta Cheese", 
      "Cavatappi Pasta", "House-Made Green Goddess Dressing"
    ]
  },
  {
    "id": 17,
    "name": "Kids Awesome Box",
    "ingredients": [
      "House-Grilled Chicken", "Edamame / Shelled Edamame", "Carrot Sticks", "Granny Smith Apples", 
      "Unsweetened Milk", "Cavatappi Pasta", "Ranch Dressing", "Juice"
    ]
  }
];

// Dynamically generate all unique ingredients for suggestions/autocomplete
const ALL_INGREDIENTS = Array.from(new Set(MENU_DATA.flatMap(m => m.ingredients))).sort();

export default function Home() {
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  
  const [openUsed, setOpenUsed] = useState<Record<number, boolean>>({});
  const [openMissed, setOpenMissed] = useState<Record<number, boolean>>({});
  
  // State for the Full Menu accordions
  const [isFullMenuOpen, setIsFullMenuOpen] = useState<boolean>(false);
  const [openMenuKey, setOpenMenuKey] = useState<Record<number, boolean>>({});

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
    return ALL_INGREDIENTS.filter(
      (ing) => ing.toLowerCase().includes(query) && !selected.includes(ing.toLowerCase())
    ).slice(0, 5);
  }, [customInput, selected]);

  // Instantly process recipes against selected ingredients (No API required)
  const processedRecipes = useMemo(() => {
    if (selected.length === 0) return [];

    const results = MENU_DATA.map(meal => {
      const used = meal.ingredients.filter(ing => 
        selected.some(s => ing.toLowerCase().includes(s) || s.includes(ing.toLowerCase()))
      );
      const missed = meal.ingredients.filter(ing => 
        !selected.some(s => ing.toLowerCase().includes(s) || s.includes(ing.toLowerCase()))
      );
      
      return {
        id: meal.id,
        title: meal.name,
        usedIngredientCount: used.length,
        missedIngredientCount: missed.length,
        usedIngredients: used.map(u => ({ original: u })),
        missedIngredients: missed.map(m => ({ original: m }))
      };
    });

    // Only show meals where at least 1 ingredient matches
    const matched = results.filter(r => r.usedIngredientCount > 0);

    return matched.sort((a, b) => {
      if (a.missedIngredientCount !== b.missedIngredientCount) {
        return a.missedIngredientCount - b.missedIngredientCount; // Fewest missing items first
      }
      return b.usedIngredientCount - a.usedIngredientCount; // Most used items first
    });
  }, [selected]);

  // Dynamically calculate the most needed missing ingredients based on current matches
  const suggestions = useMemo(() => {
    if (selected.length === 0) return ALL_INGREDIENTS.slice(0, 15);
    
    const counts: Record<string, number> = {};
    processedRecipes.forEach(recipe => {
      recipe.missedIngredients.forEach(m => {
        counts[m.original] = (counts[m.original] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 15);
  }, [processedRecipes, selected]);

  const toggleAccordion = (id: number, type: 'used' | 'missed') => {
    if (type === 'used') setOpenUsed(prev => ({ ...prev, [id]: !prev[id] }));
    if (type === 'missed') setOpenMissed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMenuKey = (id: number) => {
    setOpenMenuKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-[#f0eae1] to-[#e6dccf] animate-ambient text-stone-700 p-4 md:p-8 max-w-3xl mx-auto flex flex-col items-center">
      
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-light tracking-wide text-stone-800 mb-1">Podge</h1>
        <p className="text-stone-500 text-xs font-light tracking-wide">Turn what you have into something wonderful</p>
      </header>

      <section className="w-full mb-6 relative flex justify-center">
        <form onSubmit={handleAddCustom} className="flex gap-2 w-full max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Search or add ingredient..."
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

      <section className="w-full mb-8 flex flex-col items-center">
        <h2 className="text-[10px] uppercase tracking-widest text-stone-400 font-medium mb-3">
          {selected.length === 0 ? 'Menu Ingredients' : 'Suggested Additions'}
        </h2>
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {suggestions.map((ing) => {
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

      <section className="w-full flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <h2 className="text-sm font-medium text-stone-800 tracking-wide">Matching Meals ({processedRecipes.length})</h2>
        </div>

        {processedRecipes.length === 0 && selected.length > 0 && (
          <p className="text-stone-400 text-xs font-light italic text-center py-6">No meals found using these ingredients.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {processedRecipes.map((recipe) => {
            const isUsedOpen = openUsed[recipe.id];
            const isMissedOpen = openMissed[recipe.id];

            return (
              <div
                key={recipe.id}
                className="bg-white/70 backdrop-blur-md border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col text-center"
              >
                <div className="bg-[#f0eae1]/50 border-b border-stone-200/50 py-5 px-4 flex items-center justify-center min-h-[100px]">
                   <h3 className="font-medium text-stone-800 text-sm leading-snug">
                     {recipe.id}. {recipe.title}
                   </h3>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 items-center">
                  <div className="w-full">
                    
                    <div className="text-xs text-stone-500 space-y-2.5 w-full">
                      
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

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Menu Reference Section */}
      <section className="w-full mt-10 mb-4 max-w-xl mx-auto">
        <button
          onClick={() => setIsFullMenuOpen(!isFullMenuOpen)}
          className="w-full py-3 px-4 bg-white/50 backdrop-blur-sm border border-stone-200/70 rounded-2xl text-stone-600 font-medium text-xs flex justify-between items-center hover:bg-white/80 transition shadow-sm"
        >
          <span className="tracking-wide uppercase text-[10px]">📋 View Full Menu Key</span>
          <span className="text-stone-400">{isFullMenuOpen ? '▴' : '▾'}</span>
        </button>
        
        {isFullMenuOpen && (
          <div className="mt-3 space-y-2">
            {MENU_DATA.map((meal) => {
              const isMenuOpen = openMenuKey[meal.id];
              return (
                <div 
                  key={meal.id} 
                  className="bg-white/40 backdrop-blur-sm border border-stone-200/50 rounded-xl flex flex-col text-xs shadow-sm overflow-hidden"
                >
                  <button 
                    onClick={() => toggleMenuKey(meal.id)}
                    className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/60 transition text-left"
                  >
                    <span className="font-medium text-stone-700">{meal.id}. {meal.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium bg-stone-200/50 px-2.5 py-1 rounded-lg">
                        {meal.ingredients.length} items
                      </span>
                      <span className="text-stone-400">{isMenuOpen ? '▴' : '▾'}</span>
                    </div>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="px-4 pb-3 border-t border-stone-200/40 mt-1 pt-3">
                      <ul className="space-y-1.5 text-stone-500 text-[11px] pl-2 border-l-2 border-stone-300/60">
                        {meal.ingredients.map((ing, idx) => (
                          <li key={idx} className="font-light">• {ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}
