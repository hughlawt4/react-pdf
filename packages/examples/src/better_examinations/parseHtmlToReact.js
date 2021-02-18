import chalk from 'chalk';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export const getStyleObject = componentName => {
  const styles = {
    p: {
      marginBottom: 20,
    },
    br: {
      display: 'block',
      marginBottom: 10,
    },
    bold: {
      fontWeight: 'bold',
      fontStyle: 'bold',
      color: 'black',
    },
    italic: {
      fontStyle: 'italic',
    },
    underline: {
      textDecoration: 'underline',
    },
    list: {
      display: 'block',
      position: 'relative',
      left: '10px',
    },
    listItem: {
      display: 'list-item',
      listStyleType: 'disc',
      listStylePosition: 'outside',
      marginLeft: '10px',
    },
    div: {
      display: 'block',
      minHeight: 1,
    },
  };

  switch (componentName) {
    case 'p':
      return styles.p;
    case 'br':
      return styles.br;
    case 'b':
      return styles.bold;
    case 'u':
      return styles.underline;
    case 'i':
      return styles.italic;
    case 'em':
      return styles.italic;
    case 'ul':
      return styles.list;
    case 'ol':
      return styles.list;
    case 'li':
      return styles.listItem;
    case 'div':
      return styles.div;
    default:
      return {};
  }
};

export const HtmlToReact = (html, components) => {
  if (!html) {
    return null;
  }

  let hasUnwrapped = false;

  const transform = (node, idx) => {
    const isTextNode = node.type === 'text';

    if (node.type !== 'tag' && node.type !== 'text') {
      if (['style', 'comment'].includes(node.type)) {
        console.log(
          chalk.yellow(
            `${node.type} is one of the excluded types, skipping...`,
          ),
        );
        return null;
      }
      console.log(node.name);
      console.log('not a tag or text, returning!');
      console.log(node);
      return;
    }

    // const componentName = node.name.charAt(0).toUpperCase() + node.name.slice(1);
    const componentName = isTextNode ? 'p' : node.name.toLowerCase();

    const Component = components[componentName];

    if (Component === undefined) {
      console.log(`no component found for ${componentName}`, Component);
    }

    const Text = components['p'];

    // if (componentName === 'div') {
    //   console.log(componentName);
    //   console.log(node);
    // }

    const props = {
      ...node.attribs,
      style: getStyleObject(componentName),
    };

    if (props.class) {
      props.className = props.class;
      delete props.class;
    }

    if (isTextNode) {
      console.log(chalk.red('Found an unwrapped text node'));
      hasUnwrapped = true;
      return <Component>{node.data}</Component>;
    }

    if (Component && node && node.children && node.children.length) {
      const parentListType = componentName === 'li' ? node.parent?.name : null;
      try {
        return (
          <Component {...props} key={idx}>
            {parentListType && (
              <Text>{parentListType === 'ol' ? `${idx + 1}. ` : `- `}</Text>
            )}
            {node.children.map((child, i) => {
              if (child.type === 'text') {
                return child.data;
              }

              return transform(child, i);
            })}
          </Component>
        );
      } catch (error) {
        console.log(error);
      }
    }
    if (Component) {
      try {
        return (
          <>
            {componentName === 'li' && <Text> - </Text>}
            {componentName === 'br' ? (
              <Component {...props} key={idx}></Component>
            ) : (
              <Component {...props} key={idx} />
            )}
          </>
        );
      } catch (error) {
        console.log(error);
      }
    }

    return null;
  };

  let Component;

  try {
    Component = ReactHtmlParser(html, {
      transform,
    });
  } catch (error) {
    console.log(error);
  }

  return {
    component: Component,
    hasUnwrapped,
  };
};
