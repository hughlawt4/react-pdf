import chalk from 'chalk';
import React from 'react';
import ReactHtmlParser from 'react-html-parser';

export const HtmlToReact = (html, components, debug) => {
  if (!html) {
    return null;
  }

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

    const props = {
      ...node.attribs,
      style: getStyleObject(componentName),
    };

    if (props.class) {
      props.className = props.class;
      delete props.class;
    }

    if (Component && node && node.children && node.children.length) {
      console.log(node.type, node.children.length);
      if (node.children.length > 100) return;
      return (
        <Component {...props} key={idx}>
          {node.children.map((child, i) => {
            if (child.type === 'text') {
              return child.data;
            }

            return transform(child, i);
          })}
        </Component>
      );
    } else if (Component) {
      return <Component {...props} key={idx} />;
    }

    return null;
  };

  const Component = ReactHtmlParser(html, {
    transform,
  });
  return Component;
};

export const getStyleObject = componentName => {
  const styles = {
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
    unorderedList: {
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
  };

  switch (componentName) {
    case 'b':
      return styles.bold;
    case 'u':
      return styles.underline;
    case 'i':
      return styles.italic;
    case 'ul':
      return styles.unorderedList;
    case 'li':
      return styles.listItem;
    default:
      return {};
  }
};
