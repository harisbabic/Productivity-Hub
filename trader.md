Below is a “high-end” MACD trading algorithm expressed in clear, Python-like pseudocode (no external libraries), showing professional features beyond a simple “MACD cross = buy” approach:

Key Enhancements Included
	•	Incremental (streaming) EMA/MACD updates (no re-calc loops)
	•	Multi-timeframe trend & volatility filters (fast = 1m, slow = 15m)
	•	Histogram quality & acceleration filter (avoid weak crosses)
	•	Regime classification (trend / range / volatility buckets)
	•	Adaptive position sizing (ATR- & risk-based)
	•	Structured state machine (FLAT / LONG / SHORT / EXIT_PENDING)
	•	Dynamic stops: initial ATR stop + trailing logic + time stop
	•	“Meta” filter stub (optional ML probability gate)
	•	Divergence detector (optional enhancement)
	•	Comprehensive logging & evaluation hooks

⸻

1. Core Concepts (Plain English)

Concept	Purpose
MACD Line = EMA_fast − EMA_slow	Momentum direction & strength
Signal Line = EMA(MACD, signal_len)	Smooth reference
Histogram = MACD − Signal	Momentum impulse (acceleration)
Acceleration = ΔHistogram	Confirms force behind a cross
Higher Timeframe Trend (HTF)	Filter: trade only with broader direction
ATR & Vol Regime	Scale stops & decide if signal environment is favorable
State Machine	Keeps logic deterministic & debounced
Risk Model	Size position so max loss ≈ predefined % of equity
Meta Filter	(Optional) ML probability that signal reaches target before stop


⸻

2. High-Level Flow

For each incoming 1-minute bar:
    Update fast timeframe indicators (MACD, ATR, EMAs)
    Every time a 15-minute bar completes -> update higher timeframe EMAs / trend
    Classify regime (trend strength, volatility bucket, range vs expansion)
    Detect MACD events (zero cross, signal cross, histogram surge)
    Check divergence (optional)
    Build feature bundle -> (optionally) query meta filter (probability)
    If FLAT and entry conditions pass -> open position with sized shares
    If in position -> manage stops, trail, partial exits based on histogram decay / time
    Log everything (signal evaluation metrics)


⸻

3. Pseudocode (Readable but Detailed)

############################
# CONFIG & PARAMETERS
############################
CONFIG = {
    # MACD
    'fast_len': 12,
    'slow_len': 26,
    'signal_len': 9,

    # Multi-timeframe (assume we feed 1m bars; we aggregate 15m)
    'htf_minutes': 15,
    'htf_trend_ema_len': 50,   # on 15m bars

    # Risk / sizing
    'risk_per_trade_pct': 0.005,  # 0.5% of equity
    'max_portfolio_risk_pct': 0.02,
    'atr_len': 14,
    'atr_mult_stop': 1.8,
    'atr_mult_trail': 1.0,
    'time_stop_minutes': 120,

    # Filters
    'min_hist_accel': 0.0,     # require non-negative acceleration
    'min_hist_strength_frac_atr': 0.05,
    'vol_regime_low': 0.4,     # ATR% of price thresholds
    'vol_regime_high': 1.6,
    'min_meta_prob': 0.55,     # optional ML gate

    # Divergence window
    'div_window': 30,          # bars to scan for swing highs/lows

    # Partial exits
    'partial_tp_atr_mult': 1.2,
    'partial_size_frac': 0.5,

    # Logging
    'log_signals': True
}

############################
# STATE CONTAINERS
############################
class MACDState:
    def __init__(self):
        self.fast_ema = None
        self.slow_ema = None
        self.signal_ema = None
        self.macd = None
        self.hist = None
        self.prev_hist = None
        self.prev_macd = None

class ATRState:
    def __init__(self):
        self.atr = None
        self.prev_close = None

class Position:
    def __init__(self):
        self.status = 'FLAT'
        self.entry_price = None
        self.size = 0
        self.stop = None
        self.trailing_stop = None
        self.partial_taken = False
        self.entry_time = None

class HigherTimeframe:
    def __init__(self):
        self.buffer = []        # collects 1m bars until 15m complete
        self.ema_trend = None
        self.ema_len = CONFIG['htf_trend_ema_len']

############################
# UTILITY FUNCTIONS
############################
def ema_update(prev, price, length):
    alpha = 2.0 / (length + 1)
    return price if prev is None else prev + alpha * (price - prev)

def compute_true_range(bar, prev_close):
    if prev_close is None: return bar.high - bar.low
    return max(bar.high - bar.low,
               abs(bar.high - prev_close),
               abs(bar.low - prev_close))

def wilder_update(prev, new_val, length):
    return new_val if prev is None else ( (prev * (length - 1)) + new_val ) / length

def volatility_regime(atr_pct):
    if atr_pct < CONFIG['vol_regime_low']: return 'LOW'
    if atr_pct > CONFIG['vol_regime_high']: return 'HIGH'
    return 'NORMAL'

def trend_filter(htf_price, htf_ema):
    if htf_ema is None: return 'UNKNOWN'
    return 'UP' if htf_price > htf_ema else 'DOWN'

def meta_probability(features):
    # Placeholder stub for ML meta filter – return fixed 0.6 for demo
    return 0.60

############################
# DIVERGENCE DETECTION (Simplified)
############################
def detect_bullish_divergence(price_series, hist_series, window):
    # Price makes lower low while histogram makes higher low
    if len(price_series) < window: return False
    recent_prices = price_series[-window:]
    recent_hist = hist_series[-window:]
    # find two swing lows (simplified)
    pivots = [(i, recent_prices[i]) for i in range(2, window-2)
              if recent_prices[i] < recent_prices[i-1] and recent_prices[i] < recent_prices[i+1]]
    if len(pivots) < 2: return False
    piv1, piv2 = pivots[-2], pivots[-1]
    if recent_prices[piv2[0]] < recent_prices[piv1[0]]:        # lower low
        if recent_hist[piv2[0]] > recent_hist[piv1[0]]:        # higher hist low
            return True
    return False

def detect_bearish_divergence(price_series, hist_series, window):
    if len(price_series) < window: return False
    recent_prices = price_series[-window:]
    recent_hist = hist_series[-window:]
    pivots = [(i, recent_prices[i]) for i in range(2, window-2)
              if recent_prices[i] > recent_prices[i-1] and recent_prices[i] > recent_prices[i+1]]
    if len(pivots) < 2: return False
    piv1, piv2 = pivots[-2], pivots[-1]
    if recent_prices[piv2[0]] > recent_prices[piv1[0]]:         # higher high
        if recent_hist[piv2[0]] < recent_hist[piv1[0]]:         # lower hist high
            return True
    return False

############################
# MAIN ENGINE (Called per 1-minute bar)
############################
class MACDTradingAlgo:
    def __init__(self, equity=100000):
        self.macd_state = MACDState()
        self.atr_state = ATRState()
        self.pos = Position()
        self.htf = HigherTimeframe()
        self.equity = equity
        self.price_history = []     # closes
        self.hist_history = []      # hist values
        self.logs = []

    def on_new_bar(self, bar):
        """
        bar: object with .open, .high, .low, .close, .volume, .timestamp
        """
        # 1. Update indicators
        self._update_macd(bar.close)
        self._update_atr(bar)
        atr_pct = (self.atr_state.atr / bar.close * 100) if self.atr_state.atr else None
        vol_reg = volatility_regime(atr_pct) if atr_pct else 'UNKNOWN'

        # 2. Update higher timeframe (15m aggregator)
        htf_complete = self._update_higher_timeframe(bar)
        if htf_complete:  # update HTF EMA on the aggregated 15m close
            self.htf.ema_trend = ema_update(self.htf.ema_trend,
                                            htf_complete.close,
                                            self.htf.ema_len)

        # 3. Prepare contextual filters
        trend_dir = trend_filter(bar.close, self.htf.ema_trend)
        bullish_div = detect_bullish_divergence(self.price_history, self.hist_history,
                                                CONFIG['div_window'])
        bearish_div = detect_bearish_divergence(self.price_history, self.hist_history,
                                                CONFIG['div_window'])

        # 4. Build features for meta filter
        features = {
            'hist': self.macd_state.hist,
            'hist_accel': self._hist_accel(),
            'trend_dir': trend_dir,
            'vol_reg': vol_reg,
            'bull_div': bullish_div,
            'bear_div': bearish_div,
            'atr_pct': atr_pct
        }
        meta_prob = meta_probability(features)

        # 5. Signal evaluation (entry / exit logic)
        self._maybe_enter(bar, features, meta_prob)
        self._manage_position(bar, features)

        # 6. Archival / Logging
        if CONFIG['log_signals']:
            self._log(bar, features, meta_prob)

    ########################
    # Indicator Helpers
    ########################
    def _update_macd(self, price):
        ms = self.macd_state
        ms.fast_ema = ema_update(ms.fast_ema, price, CONFIG['fast_len'])
        ms.slow_ema = ema_update(ms.slow_ema, price, CONFIG['slow_len'])
        prev_macd = ms.macd
        ms.macd = ms.fast_ema - ms.slow_ema
        ms.signal_ema = ema_update(ms.signal_ema, ms.macd, CONFIG['signal_len'])
        ms.prev_hist = ms.hist
        ms.hist = ms.macd - ms.signal_ema
        ms.prev_macd = prev_macd
        # maintain histories
        self.price_history.append(price)
        self.hist_history.append(ms.hist)

    def _update_atr(self, bar):
        tr = compute_true_range(bar, self.atr_state.prev_close)
        self.atr_state.atr = wilder_update(self.atr_state.atr, tr, CONFIG['atr_len'])
        self.atr_state.prev_close = bar.close

    def _hist_accel(self):
        ms = self.macd_state
        if ms.prev_hist is None or ms.hist is None: return 0
        return ms.hist - ms.prev_hist

    ########################
    # Higher Timeframe Aggregation
    ########################
    def _update_higher_timeframe(self, bar):
        htf = self.htf
        htf.buffer.append(bar)
        # If buffer spans the 15-minute window (assume 1m bars)
        if len(htf.buffer) == CONFIG['htf_minutes']:
            o = htf.buffer[0].open
            h = max(b.high for b in htf.buffer)
            l = min(b.low for b in htf.buffer)
            c = htf.buffer[-1].close
            v = sum(b.volume for b in htf.buffer)
            complete_bar = SimpleBar(o, h, l, c, v, htf.buffer[-1].timestamp)
            htf.buffer = []
            return complete_bar
        return None

    ########################
    # Entry Logic
    ########################
    def _maybe_enter(self, bar, feats, meta_prob):
        if self.pos.status != 'FLAT': return
        ms = self.macd_state
        if ms.prev_macd is None or ms.prev_hist is None: return

        # Conditions for LONG entry
        long_cross = (ms.prev_macd <= ms.signal_ema and ms.macd > ms.signal_ema)
        hist_accel_ok = feats['hist_accel'] >= CONFIG['min_hist_accel']
        hist_strength = (abs(ms.hist) / self.atr_state.atr) if self.atr_state.atr else 0
        hist_strength_ok = hist_strength >= CONFIG['min_hist_strength_frac_atr']
        trend_ok = feats['trend_dir'] == 'UP'
        vol_ok = feats['vol_reg'] != 'LOW'  # Skip extremely low vol
        div_filter = (not feats['bear_div'])  # avoid bearish divergence when going long
        meta_ok = (meta_prob >= CONFIG['min_meta_prob'])

        if (long_cross and hist_accel_ok and hist_strength_ok and trend_ok
            and vol_ok and div_filter and meta_ok):
            self._open_position(direction='LONG', price=bar.close)

        # Conditions for SHORT (mirror logic)
        short_cross = (ms.prev_macd >= ms.signal_ema and ms.macd < ms.signal_ema)
        trend_down = feats['trend_dir'] == 'DOWN'
        div_filter_short = (not feats['bull_div'])
        if (short_cross and hist_accel_ok and hist_strength_ok and trend_down
            and vol_ok and div_filter_short and meta_ok):
            self._open_position(direction='SHORT', price=bar.close)

    ########################
    # Open Position & Sizing
    ########################
    def _open_position(self, direction, price):
        atr = self.atr_state.atr or 0
        stop_dist = CONFIG['atr_mult_stop'] * atr
        if stop_dist == 0:
            return
        risk_capital = self.equity * CONFIG['risk_per_trade_pct']
        size = max(1, int(risk_capital / stop_dist))
        # position struct
        self.pos.status = direction
        self.pos.entry_price = price
        self.pos.size = size
        if direction == 'LONG':
            self.pos.stop = price - stop_dist
        else:
            self.pos.stop = price + stop_dist
        self.pos.trailing_stop = None
        self.pos.entry_time = now()

    ########################
    # Position Management
    ########################
    def _manage_position(self, bar, feats):
        if self.pos.status == 'FLAT': return
        ms = self.macd_state
        atr = self.atr_state.atr or 0
        # 1. Hard Stop
        if self.pos.status == 'LONG' and bar.low <= self.pos.stop:
            self._flatten(bar.close, reason='HARD_STOP')
            return
        if self.pos.status == 'SHORT' and bar.high >= self.pos.stop:
            self._flatten(bar.close, reason='HARD_STOP')
            return

        # 2. Partial Take Profit
        unreal = (bar.close - self.pos.entry_price) if self.pos.status == 'LONG' else (self.pos.entry_price - bar.close)
        if (not self.pos.partial_taken) and unreal >= CONFIG['partial_tp_atr_mult'] * atr:
            # take partial
            self.pos.size = int(self.pos.size * (1 - CONFIG['partial_size_frac']))
            self.pos.partial_taken = True

        # 3. Trailing Stop via histogram decay
        hist_accel = feats['hist_accel']
        if self.pos.status == 'LONG' and hist_accel < 0:
            trail = bar.close - CONFIG['atr_mult_trail'] * atr
            self.pos.trailing_stop = max(self.pos.trailing_stop or -10**9, trail)
        if self.pos.status == 'SHORT' and hist_accel < 0:
            trail = bar.close + CONFIG['atr_mult_trail'] * atr
            self.pos.trailing_stop = min(self.pos.trailing_stop or 10**9, trail)

        # Enforce trailing stop
        if self.pos.trailing_stop:
            if self.pos.status == 'LONG' and bar.low <= self.pos.trailing_stop:
                self._flatten(bar.close, reason='TRAIL_STOP')
                return
            if self.pos.status == 'SHORT' and bar.high >= self.pos.trailing_stop:
                self._flatten(bar.close, reason='TRAIL_STOP')
                return

        # 4. Time Stop
        if minutes_since(self.pos.entry_time) >= CONFIG['time_stop_minutes']:
            self._flatten(bar.close, reason='TIME_STOP')

        # 5. Adverse Histogram Flip (optional early exit)
        if self.pos.status == 'LONG' and ms.hist < 0:
            self._flatten(bar.close, reason='HIST_NEG')
        if self.pos.status == 'SHORT' and ms.hist > 0:
            self._flatten(bar.close, reason='HIST_POS')

    ########################
    # Flatten / Logging
    ########################
    def _flatten(self, price, reason):
        # Real execution would send order; here we just close
        self.pos = Position()  # reset
        # record trade result, reason, etc. (omitted for brevity)

    ########################
    # Logging
    ########################
    def _log(self, bar, feats, meta_prob):
        entry = {
            'ts': bar.timestamp,
            'price': bar.close,
            'macd': self.macd_state.macd,
            'signal': self.macd_state.signal_ema,
            'hist': self.macd_state.hist,
            'hist_accel': feats['hist_accel'],
            'trend_dir': feats['trend_dir'],
            'vol_reg': feats['vol_reg'],
            'position': self.pos.status,
            'stop': self.pos.stop,
            'trail': self.pos.trailing_stop,
            'meta_prob': meta_prob
        }
        self.logs.append(entry)

############################
# SUPPORT STRUCTS
############################
class SimpleBar:
    def __init__(self, o,h,l,c,v,ts):
        self.open=o; self.high=h; self.low=l; self.close=c; self.volume=v; self.timestamp=ts

def now():
    # placeholder for current timestamp
    return 0

def minutes_since(ts):
    return 0  # placeholder


⸻

4. Entry / Exit Logic Recap (Human Terms)

Enter LONG when:
	1.	MACD crosses above Signal this bar
	2.	Histogram ≥ previous histogram (acceleration >= 0)
	3.	Histogram magnitude ≥ threshold fraction of ATR (filter weak drifts)
	4.	Higher timeframe (15m) EMA trend is UP
	5.	Volatility regime ≠ ultra LOW (to avoid dead chop)
	6.	No bearish divergence present
	7.	Optional meta probability ≥ threshold

Exit / Manage:
	•	Hard ATR stop
	•	Partial take-profit at +1.2 ATR (example)
	•	Trailing stop activated when histogram decelerates (accel < 0)
	•	Time stop if price “goes nowhere” (prevents capital tie-up)
	•	Immediate exit if histogram flips opposite (momentum failure)

(Short logic mirrors this.)

⸻

5. Optional Enhancements

Enhancement	Description
Position Scaling	Add on subsequent “histogram acceleration + pullback hold above EMA(20)” events.
Regime-Specific Params	Use different ATR multiples in HIGH vs NORMAL volatility.
Meta-Labeling	Train a classifier to predict probability of hitting +R before −S; use as gate.
Transaction Cost Model	Skip trades with expected edge ≤ spread + slippage.
Walk-Forward Optimization	Periodically re-evaluate MACD lengths & thresholds (avoid in-sample bias).
Risk Parity Across Symbols	Normalize per-symbol position by realized volatility to equalize risk.
Divergence Weighting	If bullish divergence present, allow weaker histogram threshold for entries.


⸻

6. Validation Metrics

Metric	Why It Matters
Expectancy (avg win * win% − avg loss * loss%)	Core edge check
Win Rate by Regime (LOW / NORMAL / HIGH)	Parameter adaptivity
Average Trade Duration	Confirms time stop utility
Stop-Out Cause Distribution	See if stops or timeouts dominate
Edge Decay Post-Entry	Histogram acceleration predictive strength
Slippage vs Spread	Execution quality


⸻

7. Quick “Cheat Sheet” of Key Variables

Variable	Meaning
ms.hist	Current momentum impulse
feats['hist_accel']	Momentum change (avoid momentum stalling)
trend_dir	Multi-timeframe directional bias
atr_pct	Normalized volatility (choose regimes)
bull_div / bear_div	Divergence filters
meta_prob	Probability of success (optional)
stop / trailing_stop	Dynamic risk control


⸻

8. How to Start (Minimal Viable Version)
	1.	Implement only: MACD cross + HTF EMA trend filter + ATR stop.
	2.	Add histogram acceleration & partial profit.
	3.	Introduce volatility regime gating.
	4.	Log every signal; analyze distribution of returns before/after adding each refinement.
	5.	Only then add divergence & meta probability.

⸻

Final Notes
	•	This design prevents over-trading in chop (trend + volatility + histogram quality filters).
	•	It responds adaptively (ATR scaling; histogram-based trailing).
	•	The structure is extensible: you can drop in an ML meta-model without rewriting the core mechanics.

⸻

If you’d like next:
	1.	A lightweight backtest harness sketch?
	2.	A feature importance / meta-label workflow?
	3.	Conversion of this pseudocode into runnable Python (vectorized)?

Just tell me which (or “all”) and I’ll build it for you.