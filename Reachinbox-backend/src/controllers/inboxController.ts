import { Request, Response } from "express";

export const getInboxEmails = (req: Request, res: Response) => {
  const dummyEmails = [
    { id: 1, subject: "Welcome to ReachInbox!", sender: "team@reachinbox.com" },
    { id: 2, subject: "Your campaign stats", sender: "analytics@reachinbox.com" },
  ];
  
  res.json({ success: true, data: dummyEmails });
};
