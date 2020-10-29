/* eslint react/prop-types: 0 */
/* eslint react/jsx-sort-props: 0 */

import React from 'react';
import data from './sessions';
import { HtmlToReact } from './parseHtmlToReact';
import chalk from 'chalk';
import fs from 'fs';

import ReactPDF, {
  Document,
  Page,
  View,
  Text,
  Font,
  Image,
  StyleSheet,
} from '../dist/react-pdf.es.js';

const { sessions, questions } = data;

const styles = StyleSheet.create({
  titlePage: {
    boxSizing: 'border-box',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 200,
    // marginTop: 200,
    textAlign: 'center',
    fontFamily: 'Lato',
  },
  page: {
    paddingBottom: 30,
    color: '#333',
    fontFamily: 'Lato',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    marginLeft: 50,
    marginRight: 50,
    marginTop: 20,
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 60,
    paddingRight: 60,
    marginBottom: 10,
    marginTop: 20,
  },
  section: {
    marginLeft: 50,
    marginRight: 50,
    padding: 10,
    fontSize: 13,
  },
  title: {
    fontSize: 30,
    // marginBottom: 20,
  },
  subTitle: {
    color: '#666',
  },
  answerText: {
    color: '#787878',
    fontSize: 12,
    marginBottom: 6,
    paddingTop: 20,
    display: 'block',
    borderTopColor: '#afafaf',
    borderTopStyle: 'dotted',
    borderTopWidth: 1,
  },
  question: {
    marginBottom: 10,
    lineHeight: 1.4,
    fontSize: 11,
    color: '#565656',
  },
  answer: {
    color: '#454545',
    fontSize: 12,
    lineHeight: 2,
  },
  note: {
    fontStyle: 'italic',
    color: '#aa0000',
  },
  bold: {
    fontWeight: 'bold',
  },
  beImage: {
    width: 80,
  },
  beImageLarge: {
    width: 175,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 200,
  },
});

Font.register({
  family: 'Lato',
  fonts: [
    {
      src: `${__dirname}/fonts/Lato/Lato-Regular.ttf`,
    },
    {
      fontStyle: 'italic',
      src: `${__dirname}/fonts/Lato/Lato-Italic.ttf`,
    },
    {
      fontStyle: 'bold',
      src: `${__dirname}/fonts/Lato/Lato-Bold.ttf`,
    },
  ],
});

const getQuestionText = id => {
  const question = questions.find(q => q[id] !== undefined);
  return question[id];
};

const doc = session => (
  <Document>
    <Page size="A4" style={styles.titlePage} wrap>
      <View>
        <Text style={styles.title}>{session.exam_name}</Text>
        <Text style={styles.subTitle}>Candidate: {session.uniqueId}</Text>
      </View>
      <Image
        src={`${__dirname}/be-horizontal.png`}
        allowDangerousPaths
        style={styles.beImageLarge}
      />
    </Page>
    {session.responses.map((response, i) => (
      <Page size="A4" style={styles.page} key={`page-${i}`} wrap>
        <View style={styles.header} fixed>
          <Text>{session.exam_name}</Text>
          <Text>Candidate: {session.uniqueId}</Text>
        </View>
        <View key={i} style={styles.section}>
          <View style={styles.question}>
            {HtmlToReact(getQuestionText(response.item_reference), {
              p: Text,
              b: Text,
              u: Text,
              br: null,
              strong: Text,
              span: Text,
            })}
          </View>
          <View style={styles.answer}>
            <Text style={styles.answerText}>STUDENT ANSWER</Text>
            {response.attempted ? (
              HtmlToReact(response.response, {
                p: Text,
                b: Text,
                u: Text,
                br: null,
                strong: Text,
                span: Text,
              })
            ) : (
              <Text style={styles.note}>Not attempted</Text>
            )}
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Image
            src={`${__dirname}/be-horizontal.png`}
            allowDangerousPaths
            style={styles.beImage}
          />
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
        </View>
      </Page>
    ))}
  </Document>
);

const processSession = async session => {
  console.log(chalk.blue(`Generating PDF for User ID ${session.uniqueId}`));
  await ReactPDF.render(
    doc(session),
    `${__dirname}/exported_pdfs/${session.uniqueId}.pdf`,
  );
  console.log(chalk.green('Done.'));
};

(async function() {
  console.log(chalk.blue('Checking of the export directory exists...'));
  const folderExists = fs.existsSync(`${__dirname}/exported_pdfs`);
  console.log(
    chalk.blue(
      `${
        folderExists
          ? 'Directory already exists...'
          : 'Directory does not exist.. Creating...'
      }`,
    ),
  );
  if (!folderExists) {
    fs.mkdir(`${__dirname}/exported_pdfs`, err => {
      if (err) console.log(chalk.red('Directory not created...'));
    });
  }
  do {
    await processSession(sessions.shift());
  } while (sessions.length);
})();
