# Stormalytics

1. Finish BLR Home migration
   1. xxImport s3 bucket policy that already exists into cfn
   2. xxGet authorization lambda moved
   3. xxMaybe add common layer that contains interaction with cognito
   4. xxMaybe move UI code to blr-home for login
2. Fix bracket-revival
   1. xxReference blr-home authorization function with new bracket-specific auth
   2. xxFinish cleaning up common layer transfer from bracket to blr-home. Rename bracket common to allow both to import
3. Add auth to stormalytics
   1. x UI login flow
   2. x Authorization on POST /matchups endpoint both in AWS and frontend
   3. Change fetch calls to ajax calls
4. Add comment feature
5. Make it clear that matchup cards are clickable
6. x Edit matchup cards

## TODO
- Add youtube link
- Add direct link to open storm matchup
- Add score
- Add logos to matchup cards
- Remove hard-coding for all login site info, cookies
