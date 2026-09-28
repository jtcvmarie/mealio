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
    // Increased number to 15 for a wider variety of results and sources
    const searchRes = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=15&ranking=1&apiKey=${apiKey}`
    );
    const searchData = await searchRes.json();

    if (!Array.isArray(searchData) || searchData.length === 0) {
      return NextResponse.json([]);
    }

    const ids = searchData.map((r) => r.id).join(',');
    const bulkRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${apiKey}`
    );
    const bulkData = await bulkRes.json();

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
