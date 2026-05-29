import { Request, Response } from "express";

export function validateTournamentDate(startDate: Date, endDate: Date, req: Request, res: Response){
    const currentTime = new Date(); // 17 jan
    if(startDate < currentTime){
        throw new Error("Tounament can't be start in past!")
        // return res.status(400).json({
        //     error:"Tounament can't be start in past!"
        // })
    } 
    if(endDate < startDate){
        throw new Error("Tounament can't be end before start date")
        //  return res.status(400).json({
        //     error:"Tounament can't be end before start date"
        // })
    }
}