# Math Plugin Demo

这个示例用于验证 `bytemd-plugin-math` 与 `bytemd-plugin-math/styles/katex.css` 的组合接入是否正常。

## Inline formulae

- 欧拉恒等式：$e^{i\pi} + 1 = 0$
- 勾股定理：$a^2 + b^2 = c^2$
- 高斯分布：$f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{(x - \mu)^2}{2\sigma^2}}$

## Display formulae

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$

$$
\mathbf{A} =
\begin{bmatrix}
1 & 2 & 3 \\
0 & 1 & 4 \\
5 & 6 & 0
\end{bmatrix}
$$

## Markdown around maths

1. 行内公式应该和文本基线对齐。
2. 块级公式应该拥有稳定的上下间距。
3. 字体资源应从包内 `dist/styles/fonts/` 正常加载。
