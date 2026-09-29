export const dynamic = 'force-dynamic';

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
    // 1. Fetch from Spoonacular (FORCING NO CACHE)
    const searchRes = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredients
      )}&number=8&ranking=1&apiKey=${apiKey}`,
      { cache: 'no-store' } // <-- This forces Vercel to actually contact Spoonacular
    );
    const searchData = await searchRes.json();

    if (!Array.isArray(searchData)) {
      console.error('Spoonacular search error / quota reached:', searchData);
      return NextResponse.json(
        { error: searchData.message || 'Spoonacular daily API limit reached or error.' },
        { status: 400 }
      );
    }

    if (searchData.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch Bulk Details (FORCING NO CACHE)
    const ids = searchData.map((r) => r.id).join(',');
    const bulkRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${apiKey}`,
      { cache: 'no-store' } // <-- Forces fresh details
    );
    const bulkData = await bulkRes.json();

    if (!Array.isArray(bulkData)) {
      console.error('Spoonacular bulk error:', bulkData);
      return NextResponse.json(
        { error: bulkData.message || 'Spoonacular bulk limit reached or error.' },
        { status: 400 }
      );
    }

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
