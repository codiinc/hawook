export type Project = {
  id: string
  project_name: string
  slug: string | null
  area: string | null
  developer_name: string | null
  price_min: number | null
  price_max: number | null
  price_per_sqm_min: number | null
  price_per_sqm_max: number | null
  unit_types: string | null
  unit_sizes: string | null
  handover_date: string | null
  ownership_type: string | null
  construction_status: string | null
  status: string | null
  cover_image_url: string | null
  hawook_intro: string | null
  hawook_take: string | null
  design_commentary: string | null
  investment_commentary: string | null
  hawook_verdict: string | null
  location_description: string | null
  nearby_landmarks: string | null
  facilities: string | null
  unique_features: unknown | null
  buyer_qa: BuyerQA[] | null
  market_comparison: unknown | null
  roi_model: unknown | null
  unit_price_list: unknown | null
  developer_track_record: string | null
  developer_awards: string | null
  cam_fee_thb_sqm: number | null
  sinking_fund_thb_sqm: number | null
  foreign_quota_available: boolean | null
  rental_program_available: boolean | null
  seo_title: string | null
  seo_description: string | null
  created_at: string | null
  page_status: string | null
  total_units: number | null
  floors: number | null
}

export type BuyerQA = {
  question: string
  answer: string
  visibility: 'public' | 'private'
}

export type ProjectFollow = {
  id: string
  user_id: string
  project_id: string
  created_at: string
}
