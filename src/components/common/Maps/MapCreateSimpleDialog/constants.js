export const FIRST_PART_ERROR_MSG = 'Not valid';
export const STEPS = {
  first: 'first',
  second: 'second',
  third: 'third',
  fourth: 'fourth',
};

export const TEXT = {
  dialogTitle: 'Creating map',
  dialogClose: 'Close',
  stepBack: 'Back',
  stepNext: 'Next',
  finish: 'Create',
  steps: {
    first: {
      label: 'Map settings',
      description: '',
    },
    second: {
      label: 'Access list info',
      description: '',
    },
    third: {
      label: 'Settings',
      description: '',
    },
    fourth: {
      label: 'Final',
      description: 'Check data',
    },
  },
  mapPart: {
    name: {
      label: 'Map name',
      hint: '* Map name should contain at least 3 symbols and begins with a symbol.'
    },
    description: {
      label: 'Public map description',
      hint: 'You can leave this field empty.'
    },
    note: {
      label: 'Personal note',
      hint: 'This is a personal note which only you will see.'
    }
  },
  groupPart: {
    selectTypeDescription: 'Select group from exists or create new',
    name: {
      label: 'Access List name',
      hint: '* Access List name should contain at least 3 symbols and begins with a symbol.'
    },
    description: {
      label: 'Public Access List description',
      hint: 'You can leave this field empty.'
    },
  },
  groupSettingsPart: {
    title: 'Do you want to add corporation and alliance to your map?',
    characterSelectLabel: 'Select a character',
    shareWith: 'You able to share with your',
  }
};