const headers = {
  'User-Agent': 'Inventoria/1.0 ()',
  'Content-Type': 'application/json',
}

export const search = async (req, res, next) => {
  try {
    const { term } = req.params
    if (!term) {
      return res.status(400).json({ error: 'Search term  is required' })
    }

    const url = `https://world.openfoodfacts.net/cgi/search.pl?search_terms=${term}&search_simple=1&action=process&json=1&page_size=20&sort_by=unique_scans_n`
    const data = await fetchFromAPI(url, headers)
    const products = data?.products
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No results found' })
    }

    return res.json(products)
  } catch (err) {
    next(err)
  }
}

export const getProduct = async (barcode) => {
  try {
    if (!barcode) {
      throw new Error('Barcode is required')
    }

    const url = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=code,nutriments,product_name,product_quantity,product_quantity_unit,quantity,selected_images`
    const data = await fetchFromAPI(url, headers)
    const product = data?.product
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  } catch (err) {
    throw err
  }
}

async function fetchFromAPI(url, headers) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }
  return await response.json()
}
