# hyperlit

`hyperlit` lets you declare your [hyperapp](https://hyperapp.dev) views in a html-like fashion, similar to JSX. Unlike JSX you don't need a build-step and babel config to do it -- it happens run-time in your browser. It's quite small – ca 0.5kb.

## Getting hyperlit into your project

### Using npm

In projects where you do bundle your app up, install hyperlit using:

```sh
npm -i hyperlit
```

> Note that hyperapp is a peer-dependency which you'll also need to have installed.

Once installed, you can import `hyperlit` wherever you declare views:

```js
import html from 'hyperlit'
```

### As ES-module

If you're not bundling your page, and you are importing Hyperapp from `https://unpkg.com/hyperapp`, then use this import instead:

```js
import html from 'https://unpkg.com/hyperlit'
```

### Old-school

Just drop this in after your hyperapp script-tag:

```html
<script src="https://unpkg.com/hyperapp/dist/hyperapp.js"></script>
<script src="https://unpkg.com/hyperlit/dist/hyperlit.js"></script>
...
```

That will export a global `html` function which you use to declare the views.

## Usage

Hyperlit replaces hyperapp's built-in `h`, allowing you to write:

```js
html`
<div class="big">
    <h1>Title</h1>
    <p class="aligned">
        Content 1 <br />
        Content 2
    </p>
</div>`
```

instead of:

```js
h('div', { class: 'big' }, [
    h('h1', {}, 'title'),
    h('p', { class: 'aligned' }, [
        'Content 1',
        h('br', {}),
        'Content 2'
    ]),
])
```

### Injecting props

If you have non-string props you want to add to your vnodes, or values kept in variables, use the `${val}` syntax to
inject them:

```js
const foo = 32
const node = html`<p class=${{ bigger: foo > 30 }}>...</p>`
```

#### Spreading props

If you have a bunch of props you want to assign, you don't have to write them out individually, you can just:

```js
html`<p ${{ class: 'bigger', id: 'a-1', key: 'a-1' }}>...</p>`
```

(For compatibility with views you may have written using `htm`, the `...${props}` syntax is also supported)

### Injecting content.

```js
const name = 'Joe'
const greeting = html`<span>Hello ${name}!</span>`
```

results in `h('span', {}, ['hello', 'joe', '!'])`.

Content can be a string or a vnode. Content can also be an array:

```js
const names = ['Kim', 'Robin', 'Sam']
const person = name => html`<p>${name}</p>`
const list = html`
<div>
    <p>Members:</p>
    ${names.map(person)}
</div>`
```

results in `list` being equivalent to:

```js
h('div', {}, [
    h('p', {}, 'Members:'),
    h('p', {}, 'Kim'),
    h('p', {}, 'Robin'),
    h('p', {}, 'Sam'),
])
```

Since hyperapp filters out falsy children, you can conditionally render some content:

```js
const show = false
html`<p>Secret: ${show && 'I work for the CIA'}</p>`
```

### Components

Let's say you have this component:

```js
const box = (props, content) => html`
<div class=${{ fancy: true, active: props.active }}>
    <h1>${props.title}</h1>
    ${content}
</div>`
```

You could of course add it to a view in this way:

```js
const view = html`
<main>
    ${box({ active: false, title: 'My bio' }, [
        html`<p>Lorem ipsum</p>`,
        html`<p>Dolor sit amet</p>`,
    ])}
</main>`
```

But hyperlit allows you to do it this way as well:

```js
const view = html` <main>
    <${box} active=${false} title="My bio">
        <p>Lorem ipsum</p>
        <p>Dolor sit amet</p>
    <//>
</main>`
```

> For backwards compatibility with `htm` it is also possible to close components as `</${box}>`


## Tooling

Some people would prefer to compile their views into `h` calls at build-time – I get that. There is no such package yet but it is definitely on the roadmap.

If you want intellisense and syntax highlighting, and you are using [VS Code](https://code.visualstudio.com), get the [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) extension.

## Credits

This project was inspired by [Jason Miller's](https://github.com/developit) [htm](https://github.com/developit/htm). I found there were some quirks using `htm` with Hyperapp, and Hyperapp was planning a move away from compatibility with `htm` anyway, so I wanted a similar solution that would work better for hyperapp going forward. 

Thanks to [Jorge Bucaran](https://github.com/jorgebucaran) for making [Hyperapp](https://github.com/jorgebucaran/hyperapp) and for coming up with the name of this project!