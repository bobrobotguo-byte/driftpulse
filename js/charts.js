/**
 * 原生 SVG 金融图表渲染器（零外部依赖）
 */

export function renderLineChart(container, { dates, values, color = '#3b82f6', fill = 'rgba(59,130,246,0.12)', suffix = '' }) {
  if (!container || !values || values.length < 2) return;
  const w = 560;
  const h = 210;
  const padL = 46;
  const padR = 14;
  const padT = 14;
  const padB = 26;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const xOf = (i) => padL + (i / (values.length - 1)) * (w - padL - padR);
  const yOf = (v) => padT + (1 - (v - min) / span) * (h - padT - padB);

  const points = values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
  const areaPoints = `${padL},${h - padB} ${points} ${xOf(values.length - 1).toFixed(1)},${h - padB}`;

  const yMid = (min + max) / 2;
  const gridVals = [max, yMid, min];

  const gridSvg = gridVals
    .map((gv) => {
      const y = yOf(gv).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border)" stroke-dasharray="3 3" />
        <text x="${padL - 6}" y="${Number(y) + 4}" text-anchor="end" fill="var(--muted)" font-size="10">${gv.toFixed(1)}${suffix}</text>
      `;
    })
    .join('');

  const xLabels = [0, Math.floor(dates.length / 2), dates.length - 1]
    .map((idx) => `<text x="${xOf(idx).toFixed(1)}" y="${h - 6}" text-anchor="middle" fill="var(--muted)" font-size="10">${dates[idx]}</text>`)
    .join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="svg-chart" role="img">
      ${gridSvg}
      <polygon points="${areaPoints}" fill="${fill}" />
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />
      ${xLabels}
    </svg>
  `;
}

export function renderCorrelationMatrix(container, { tickers, matrix }) {
  if (!container || !tickers || tickers.length === 0) return;

  const header = `<tr><th></th>${tickers.map((t) => `<th>${t}</th>`).join('')}</tr>`;
  const body = tickers
    .map((rowTicker, i) => {
      const cells = matrix[i]
        .map((val) => {
          const alpha = Math.min(0.65, Math.abs(val) * 0.65);
          const bg = val >= 0 ? `rgba(59, 130, 246, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
          return `<td style="background:${bg}">${val.toFixed(2)}</td>`;
        })
        .join('');
      return `<tr><th>${rowTicker}</th>${cells}</tr>`;
    })
    .join('');

  container.innerHTML = `<table class="corr-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
}
