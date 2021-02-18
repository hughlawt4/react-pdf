/* eslint react/prop-types: 0 */
/* eslint react/jsx-sort-props: 0 */

import React from 'react';
import data from './sessions';
import { HtmlToReact } from './parseHtmlToReact';
import chalk from 'chalk';
import moment from 'moment';
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

const { sessions, questions, courseName, examname } = data;

const styles = StyleSheet.create({
  titlePage: {
    boxSizing: 'border-box',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 200,
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
    alignItems: 'center',
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
    fontSize: 20,
    marginBottom: 20,
  },
  subTitle: {
    color: '#666',
    marginBottom: 5,
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
    height: 40,
    marginLeft: -15,
  },
  beImageLarge: {
    width: 150,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 200,
  },
  li: {
    paddingLeft: 25,
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

const problematicSessions = [];
const noOfSessions = sessions.length;

const processMarkup = (markup, debug) => {
  try {
    return HtmlToReact(
      markup,
      {
        p: Text,
        b: Text,
        strong: Text,
        u: Text,
        br: null,
        span: Text,
        ul: View,
        li: Text,
        style: null,
      },
      debug,
    );
  } catch (error) {
    console.log(error);
  }
};

const processSession = async session => {
  const doc = session => (
    <Document>
      <Page size="A4" style={styles.titlePage} wrap>
        <View>
          <Text style={styles.title}>{courseName}</Text>
          <Text style={styles.subTitle}>{examname}</Text>
          <Text style={styles.subTitle}>Candidate: {session.index}</Text>
          <Text style={styles.subTitle}>
            Date taken: {moment(session.dt_started).format('DD/MM/yyyy')}
          </Text>
        </View>
        <Image
          src={`${__dirname}/image.png`}
          allowDangerousPaths
          style={styles.beImageLarge}
        />
      </Page>
      {session.responses.map((response, i) => (
        <Page size="A4" style={styles.page} key={`page-${i}`} wrap>
          <View style={styles.header} fixed>
            <Text>{examname}</Text>
            <Text>Candidate: {session.index}</Text>
          </View>
          <View key={i} style={styles.section}>
            <View style={styles.question}>
              {processMarkup(getQuestionText(response.item_reference))}
            </View>
            <View style={styles.answer}>
              <Text style={styles.answerText}>STUDENT ANSWER</Text>
              {response.attempted ? (
                processMarkup(response.response, true)
              ) : (
                <Text style={styles.note}>Not attempted</Text>
              )}
            </View>
          </View>
          <View style={styles.footer} fixed>
            <Image
              src={`${__dirname}/image.png`}
              allowDangerousPaths
              style={styles.beImage}
            />
            <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          </View>
        </Page>
      ))}
    </Document>
  );
  console.log(chalk.blue(`Generating PDF for User ID ${session.index}`));
  const alreadyExists = fs.existsSync(
    `${__dirname}/exported_pdfs/${session.index}.pdf`,
  );
  if (alreadyExists) {
    return console.log(chalk.green('File already exported... moving on.'));
  }
  try {
    const tmpSession = doc(session);
    await ReactPDF.render(
      tmpSession,
      `${__dirname}/exported_pdfs/${session.index}.pdf`,
    );
    console.log(chalk.green('Done.'));
  } catch (error) {
    console.log(error);
    problematicSessions.push(session.index);
  }
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

  console.log(
    chalk.yellow(`Processing ${noOfSessions} sessions... Let's do this!`),
  );

  // let count = 0;
  // const batchLimit = 10;

  // (function() {
  //   Promise.all(
  //     sessions.map((session, i) => {
  //       return processSession(sessions[0], i);
  //     }),
  //   ).then(console.log('finished'));
  // })();

  const start =
    (parseInt(process.argv[2], 10) && parseInt(process.argv[2], 10) - 1) || 0;
  const end =
    (parseInt(process.argv[3], 10) && parseInt(process.argv[3], 10)) ||
    start + 1;

  console.log(start);
  console.log(end);

  for (let i = start || 0; i < end; i++) {
    const session = sessions[i];
    const used = process.memoryUsage();
    for (const key in used) {
      console.log(
        `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`,
      );
    }
    await processSession(session);
    // if (i % batchLimit === 0) {
    //   console.log('hit batch limit!');
    //   process.nextTick(await processSession.bind(this, sessions[i + 1]));
    // }
  }

  // for (let i = 500; i < 1000; i++) {
  //   const session = sessions[0];
  //   const used = process.memoryUsage();
  //   for (const key in used) {
  //     console.log(
  //       `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`,
  //     );
  //   }
  //   await processSession(session);
  //   if (i % batchLimit === 0) {
  //     console.log('hit batch limit!');
  //     process.nextTick(await processSession.bind(this, sessions[i + 1]));
  //   }
  // }

  // do {
  //   await processSession(sessions[count]);
  //   count++;
  //   if (count % batchLimit === 0) {
  //     return process.nextTick()
  //   }
  // } while (sessions.length);

  console.log(
    chalk.blue(
      `Processed ${end - start - problematicSessions.length} out of ${end -
        start} successfully.`,
    ),
  );

  if (problematicSessions.length) {
    console.log(chalk.red('Had issues with the following sessions:'));
    console.log(problematicSessions);
  }
})();
