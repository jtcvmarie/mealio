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

                                                                                                                            const { data: cachedData } = await supabase
                                                                                                                                  .from('search_cache')
                                                                                                                                        .select('api_response')
                                                                                                                                              .eq('ingredients_query', queryKey)
                                                                                                                                                    .maybeSingle();

                                                                                                                                                        if (cachedData?.api_response) {
                                                                                                                                                              return NextResponse.json(cachedData.api_response);
                                                                                                                                                                  }

                                                                                                                                                                      const apiKey = process.env.SPOONACULAR_API_KEY;
                                                                                                                                                                          if (!apiKey) {
                                                                                                                                                                                return NextResponse.json(
                                                                                                                                                                                        { error: 'SPOONACULAR_API_KEY is missing' },
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
                                                                                                                                                                                                                                                    { error: `API error ${response.status}`, details: errText },
                                                                                                                                                                                                                                                            { status: response.status }
                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                          const recipeData = await response.json();

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
                                                                                                                                                                                                                                                                                                                      