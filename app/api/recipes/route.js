import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get('ingredients');

  if (!ingredients) {
    return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // 1. Find recipes by ingredients (limiting to top 6 for speed and quota efficiency)
    const searchRes = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=6&ranking=1&apiKey=${apiKey}`
    );
    const searchData = await searchRes.json();

    if (!Array.isArray(searchData) || searchData.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Extract recipe IDs and fetch full details in bulk
    const ids = searchData.map((r) => r.id).join(',');
    const bulkRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${apiKey}`
    );
    const bulkData = await bulkRes.json();

    // 3. Merge bulk details with search match counts (used/missed ingredients)
    const enrichedRecipes = bulkData.map((bulkRecipe) => {
      const basicMatch = searchData.find((r) => r.id === bulkRecipe.id);
      return {
        ...bulkRecipe,
        usedIngredientCount: basicMatch ? basicMatch.usedIngredientCount : 0,
        missedIngredientCount: basicMatch ? basicMatch.missedIngredientCount : 0,
        usedIngredients: basicMatch ? basicMatch.usedIngredients : [],
        missedIngredients: basicMatch ? basicMatch.missedIngredients : [],
      };
    });

    return NextResponse.json(enrichedRecipes);
  } catch (error) {
    console.error('Error fetching enriched recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
