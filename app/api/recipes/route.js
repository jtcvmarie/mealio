import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
      try {
            const { searchParams } = new URL(request.url);
                const ingredients = searchParams.get('ingredients');

                    if (!ingredients) {
                              return NextResponse.json(
                                        { error: 'No ingredients provided' },
                                                { status: 400 }
                              );
                    }

                        // Standardize input so "garlic,chicken" matches "chicken,garlic"
                            const queryKey = ingredients
                                  .split(',')
                                        .map((i) => i.trim().toLowerCase())
                                              .filter(Boolean)
                                                    .sort()
                                                          .join(',');

                                                              if (!queryKey) {
                                                                      return NextResponse.json(
                                                                                { error: 'Invalid ingredients parameter' },
                                                                                        { status: 400 }
                                                                      );
                                                              }

                                                                  // 1. Check Supabase cache first
                                                                      const { data: cachedData } = await supabase
                                                                            .from('search_cache')
                                                                                  .select('api_response')
                                                                                        .eq('ingredients_query', queryKey)
                                                                                              .maybeSingle();

                                                                                                  if (cachedData?.api_response) {
                                                                                                          return NextResponse.json(cachedData.api_response);
                                                                                                  }

                                                                                                      // 2. Fetch from Spoonacular on cache miss
                                                                                                          const apiKey = process.env.SPOONACULAR_API_KEY;
                                                                                                              if (!apiKey) {
                                                                                                                      return NextResponse.json(
                                                                                                                                { error: 'SPOONACULAR_API_KEY is missing in .env.local' },
                                                                                                                                        { status: 500 }
                                                                                                                      );
                                                                                                              }

                                                                                                                  const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
                                                                                                                          queryKey
                                                                                                                  )}&number=50&apiKey=${apiKey}`;

                                                                                                                      const response = await fetch(spoonacularUrl);

                                                                                                                          if (!response.ok) {
                                                                                                                                  const errText = await response.text();
                                                                                                                                        return NextResponse.json(
                                                                                                                                                    { error: `Spoonacular API returned status ${response.status}`, details: errText },
                                                                                                                                                            { status: response.status }
                                                                                                                                        );
                                                                                                                          }

                                                                                                                              const recipeData = await response.json();

                                                                                                                                  // 3. Save result to Supabase cache for future queries
                                                                                                                                      await supabase
                                                                                                                                            .from('search_cache')
                                                                                                                                                  .insert([{ ingredients_query: queryKey, api_response: recipeData }]);

                                                                                                                                                      return NextResponse.json(recipeData);
      } catch (err) {
            return NextResponse.json(
                      { error: 'Internal Server Error', details: err.message },
                            { status: 500 }
            );
      }
}

                    }
      }
}
)