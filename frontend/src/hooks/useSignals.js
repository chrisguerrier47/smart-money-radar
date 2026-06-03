import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'https://smart-money-radar-production-d651.up.railway.app'

const MOCK_SIGNALS = [
  {
    id: 1, ticker: 'NVDA', company_name: 'NVIDIA Corporation',
    score: 85, signal_count: 3, cluster_detected: 1,
    last_updated: new Date().toISOString(),
    signal_summary: '[INSIDER_BUY] Jensen Huang (CEO): Purchased 120,000 shares at $142.50 (2025-05-28)\n[ACTIVIST_13D] Starboard Value LP: Activist stake >5% with intent to influence (2025-05-22)\n[NEWS_POSITIVE] finnhub: NVIDIA awarded $2.4B government AI contract\n⚡ CLUSTER: 3 independent source types',
    llm_analysis: 'The convergence of CEO insider buying and a fresh activist 13D filing within the same week is an unusually strong signal cluster. Starboard Value filing a 13D — not the passive 13G — signals intent to push for operational or strategic changes, which historically precedes significant share price movement. The government contract announcement may have been the catalyst that brought both parties to act simultaneously, though the insider purchase predates the news by several days.',
  },
  {
    id: 2, ticker: 'INTC', company_name: 'Intel Corporation',
    score: 72, signal_count: 3, cluster_detected: 1,
    last_updated: new Date().toISOString(),
    signal_summary: '[INSIDER_BUY] Patrick Gelsinger (CEO): Purchased 250,000 shares at $31.20 (2025-05-20)\n[ACTIVIST_13D] Elliot Management: Activist stake >5% with intent to influence (2025-05-18)\n[NEWS_POSITIVE] Reuters: Intel awarded $8.5B CHIPS Act grant\n⚡ CLUSTER: 3 independent source types',
    llm_analysis: 'Elliott Management filing a 13D at Intel carries significant weight given their track record of forcing operational improvements at semiconductor companies. The CEO purchase days after the activist filing may indicate internal alignment with Elliott\'s thesis rather than concern. The CHIPS Act grant provides a concrete capital catalyst that could accelerate the turnaround timeline both parties appear to be betting on.',
  },
  {
    id: 3, ticker: 'PLTR', company_name: 'Palantir Technologies',
    score: 58, signal_count: 2, cluster_detected: 1,
    last_updated: new Date().toISOString(),
    signal_summary: '[INSIDER_BUY] Alex Karp (CEO): Purchased 1,800,000 shares at $24.10 (2025-05-15)\n[NEWS_POSITIVE] Bloomberg: Palantir wins $500M DoD AI contract\n⚡ CLUSTER: 2 independent source types',
    llm_analysis: 'Karp\'s $43M personal purchase is notable in scale — this is not a routine executive grant or small symbolic buy. His purchasing history shows a pattern of buying near what he perceives as inflection points. The DoD contract win announced shortly after suggests possible visibility into the pipeline, though insider trading rules prohibit trading on material non-public information.',
  },
  {
    id: 4, ticker: 'AMZN', company_name: 'Amazon.com Inc.',
    score: 52, signal_count: 2, cluster_detected: 1,
    last_updated: new Date().toISOString(),
    signal_summary: '[ACTIVIST_13G] ValueAct Capital: Passive stake >5% disclosed (2025-05-10)\n[INSIDER_BUY] Andy Jassy (CEO): Purchased 50,000 shares at $184.20 (2025-05-08)\n⚡ CLUSTER: 2 independent source types',
    llm_analysis: 'ValueAct choosing 13G over 13D suggests a currently passive stance, though they frequently upgrade to 13D after initial engagement with management. Combined with Jassy\'s personal purchase, there appears to be shared conviction around AWS growth reacceleration and advertising revenue momentum heading into the next earnings cycle.',
  },
  {
    id: 5, ticker: 'AMD', company_name: 'Advanced Micro Devices',
    score: 42, signal_count: 2, cluster_detected: 0,
    last_updated: new Date().toISOString(),
    signal_summary: '[INSIDER_BUY] Lisa Su (CEO): Purchased 80,000 shares at $156.40 (2025-05-12)\n[NEWS_POSITIVE] WSJ: AMD secures Microsoft AI chip partnership',
    llm_analysis: 'Lisa Su has a strong track record of well-timed insider purchases. The Microsoft partnership announcement validates AMD\'s positioning in the AI accelerator market as an alternative to NVIDIA. Note that insider buying alone without additional institutional convergence limits the overall conviction score.',
  },
]

const MOCK_RAW = [
  { id: 1, ticker: 'NVDA', signal_type: 'insider_buy', source: 'Finnhub', actor: 'Jensen Huang (CEO)', description: 'Purchased 120,000 shares at $142.50', amount_usd: 17100000, shares: 120000, filed_at: '2025-05-28T00:00:00', raw_score: 30 },
  { id: 2, ticker: 'NVDA', signal_type: 'activist_13d', source: 'SEC EDGAR', actor: 'Starboard Value LP', description: 'Activist stake >5% with intent to influence', amount_usd: null, shares: null, filed_at: '2025-05-22T00:00:00', raw_score: 25 },
  { id: 3, ticker: 'NVDA', signal_type: 'news_positive', source: 'Finnhub News', actor: 'Reuters', description: 'NVIDIA awarded $2.4B government AI contract', amount_usd: null, shares: null, filed_at: '2025-05-26T00:00:00', raw_score: 10 },
]


export function useSignals({ minScore = 40, clusterOnly = false } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ min_score: minScore })
      if (clusterOnly) params.set('cluster_only', 'true')
      const res = await window.fetch(`${API_BASE}/signals?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setUsingMock(false)
    } catch {
      setData(MOCK_SIGNALS.filter(s =>
        s.score >= minScore && (!clusterOnly || s.cluster_detected)
      ))
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [minScore, clusterOnly])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, usingMock, refetch: fetch }
}


export function useTickerDetail(ticker) {
  const [score, setScore] = useState(null)
  const [rawSignals, setRawSignals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker) return
    const load = async () => {
      setLoading(true)
      try {
        const [s, r] = await Promise.all([
          window.fetch(`${API_BASE}/signals/${ticker}`),
          window.fetch(`${API_BASE}/signals/${ticker}/raw`),
        ])
        if (s.ok) setScore(await s.json())
        if (r.ok) setRawSignals(await r.json())
      } catch {
        setScore(MOCK_SIGNALS.find(s => s.ticker === ticker) || null)
        setRawSignals(MOCK_RAW.filter(s => s.ticker === ticker))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ticker])

  return { score, rawSignals, loading }
}